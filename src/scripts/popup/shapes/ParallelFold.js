
import * as THREE from "three";
import {EPSILON} from "../consts.js";
import {Shape} from "./Shape.js";
import {Gully} from "../Gully.js";

let debugMeshMaterial = new THREE.MeshLambertMaterial({color: 0xcccc00, shading: THREE.SmoothShading, side: THREE.DoubleSide});

function ParallelFold(origin, a, b, c, d) {

    Shape.call(this);

    this.origin = origin;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;

    // Gullies

    this.gullies = [
        new Gully(),
        new Gully(),
        new Gully(),
        new Gully(),
        new Gully(),
        new Gully()
    ];
    this.add.apply(this, this.gullies);

    // Debug

    this.debugMesh0 = new THREE.Mesh(new THREE.Geometry(), debugMeshMaterial);
    this.debugMesh0.geometry.vertices.push(
        new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(),
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0));
    this.debugMesh0.geometry.faces.push(
        new THREE.Face3(0, 3, 4), new THREE.Face3(4, 1, 0),
        new THREE.Face3(1, 4, 5), new THREE.Face3(5, 2, 1)
    );
    this.add(this.debugMesh0);

}

ParallelFold.prototype = Object.assign(Object.create(Shape.prototype), {

    interpolate: function (angle) {

        // Set position origin

        this.position.set(0, this.origin + (this.parent ? this.parent.shapeOrigin : 0), 0);

        // Interpolate gullies

        this.setAngle(angle);

        let a = this.a,
            b = this.b,
            c = this.c,
            d = this.d;
        angle = this.angle;

        // Skip redundant interpolation

        if (a === this._a
            && b === this._b
            && c === this._c
            && d === this._d
            && angle === this._angle) {

            // Interpolate for each gully
            for (let gully of this.gullies) {
                gully.interpolate();
            }

            return;

        }

        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
        this._angle = angle;

        // Constraints

        if ([a, b, c, d].some(function (x) {return x < 0;})) {
            console.warn("Constraint failed: a, b, c, d >= 0");
            return;
        } else if (Math.abs(a + c - b - d) >= EPSILON) {
            console.warn("Constraint failed: a + c = b + d; lengths on each side should balance");
            return;
        } else if (c + d < a + b && angle > calcTriangleInnerAngle(a, b, c + d)) {
            console.warn("Constraint failed: c + d < a + b && angle limited by parallel fold");
            return;
        }

        // Set up foundational vectors

        let shapeForward = new THREE.Vector3(0, 1, 0);
        let shapeUp = new THREE.Vector3(0, 0, 1);
        let shapeRight = new THREE.Vector3(1, 0, 0);

        // Find parallel-fold position

        let p1 = shapeUp.clone().applyAxisAngle(shapeForward, angle / 2).multiplyScalar(b);
        let p2 = shapeUp.clone().applyAxisAngle(shapeForward, - angle / 2).multiplyScalar(a);
        let p2p1 = p2.clone().multiplyScalar(-1).add(p1);
        let theta = calcTriangleInnerAngle(c, p2p1.length(), d);
        let p3 = p2.clone().add(p2p1.clone().normalize().applyAxisAngle(shapeForward, - theta).multiplyScalar(c));

        let p1p3 = p1.clone().multiplyScalar(-1).add(p3);
        let p3p1 = p1p3.clone().negate();
        let p2p3 = p2.clone().multiplyScalar(-1).add(p3);
        let p3p2 = p2p3.clone().negate();

        // Gullies

        let gullyDirection = shapeForward;

        [
            [
                p1,
                p1.clone().normalize().add(p1p3.clone().normalize()).multiplyScalar(0.5).normalize(),
                p1.angleTo(p1p3),
                false
            ],
            [
                p1,
                p1.clone().negate().normalize().add(p1p3.clone().normalize()).multiplyScalar(0.5).normalize(),
                p1.clone().negate().angleTo(p1p3),
                false
            ],
            [
                p3,
                p3p1.clone().normalize().add(p3p2.clone().normalize()).multiplyScalar(-0.5).normalize(),
                p3p1.angleTo(p3p2),
                true
            ],
            [
                p3,
                p3p1.clone().normalize().add(p3p2.clone().normalize()).multiplyScalar(0.5).normalize(),
                p3p1.angleTo(p3p2),
                false
            ],
            [
                p2,
                p2.clone().normalize().add(p2p3.clone().normalize()).multiplyScalar(0.5).normalize(),
                p2.angleTo(p2p3),
                false
            ],
            [
                p2,
                p2.clone().negate().normalize().add(p2p3.clone().normalize()).multiplyScalar(0.5).normalize(),
                p2.clone().negate().angleTo(p2p3),
                false
            ]
        ].forEach(function (_, i) {

            let [gullyPosition, gullyUp, gullyAngle, useSupplementaryAngle] = _;

            if (useSupplementaryAngle) gullyAngle = 2 * Math.PI - gullyAngle;

            let gullyRight = gullyDirection.clone().cross(gullyUp).normalize();

            // Update the gully

            let gully = this.gullies[i];

            gully.position.copy(gullyPosition);

            let gullyRotationMatrix = new THREE.Matrix4();
            gullyRotationMatrix.elements = [
                gullyRight.x, gullyRight.y, gullyRight.z, 0,
                gullyDirection.x, gullyDirection.y, gullyDirection.z, 0,
                gullyUp.x, gullyUp.y, gullyUp.z, 0,
                0, 0, 0, 1
            ];
            gully.setRotationFromMatrix(gullyRotationMatrix);

            gully.interpolate(gullyAngle);

        }, this);

        // Debug

        this.debugMesh0.geometry.vertices[0].setX(p1.x);
        this.debugMesh0.geometry.vertices[0].setZ(p1.z);
        this.debugMesh0.geometry.vertices[1].setX(p3.x);
        this.debugMesh0.geometry.vertices[1].setZ(p3.z);
        this.debugMesh0.geometry.vertices[2].setX(p2.x);
        this.debugMesh0.geometry.vertices[2].setZ(p2.z);
        this.debugMesh0.geometry.vertices[3].setX(p1.x);
        this.debugMesh0.geometry.vertices[3].setZ(p1.z);
        this.debugMesh0.geometry.vertices[4].setX(p3.x);
        this.debugMesh0.geometry.vertices[4].setZ(p3.z);
        this.debugMesh0.geometry.vertices[5].setX(p2.x);
        this.debugMesh0.geometry.vertices[5].setZ(p2.z);
        this.debugMesh0.geometry.computeFaceNormals();
        this.debugMesh0.geometry.verticesNeedUpdate = true;
        this.debugMesh0.geometry.normalsNeedUpdate = true;

    }

});

function calcTriangleInnerAngle(a, b, c) {
    return Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b));
}

export {ParallelFold};