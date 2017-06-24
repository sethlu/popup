
import * as THREE from "three";
import {EPSILON} from "../consts.js";
import {Shape} from "./Shape.js";
import {Gully} from "../Gully.js";

let debugMeshMaterial = new THREE.MeshLambertMaterial({color: 0x00cccc, shading: THREE.SmoothShading, side: THREE.DoubleSide});

/**
 * The v-fold sits on a gully
 * @constructor
 * @param origin
 * @param a
 * @param b
 * @param c
 * @param d
 */
function VFold(origin, a, b, c, d) {

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

    this.gullies[1].debugLine0.material = this.gullies[3].debugLine0.material = this.gullies[5].debugLine0.material = new THREE.LineBasicMaterial({color: 0x00cc00});

    // Debug

    // this.debugLine0 = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xff00ff}));
    // this.debugLine0.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    // this.add(this.debugLine0);

    // this.debugLine1 = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xff0000}));
    // this.debugLine1.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    // this.add(this.debugLine1);

    // this.debugLine2 = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xff0000}));
    // this.debugLine2.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    // this.add(this.debugLine2);
    // this.debugLine3 = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xff0000}));
    // this.debugLine3.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    // this.add(this.debugLine3);

    this.debugMesh0 = new THREE.Mesh(new THREE.Geometry(), debugMeshMaterial);
    this.debugMesh0.geometry.vertices.push(
        new THREE.Vector3(),
        new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
    );
    this.debugMesh0.geometry.faces.push(
        new THREE.Face3(0, 1, 2), new THREE.Face3(0, 2, 3)
    );
    this.add(this.debugMesh0);

}

VFold.prototype = Object.assign(Object.create(Shape.prototype), {

    interpolate: function (angle = Math.PI) {

        this.position.set(0, this.origin, 0);

        // Interpolate gullies

        let a = this.a,
            b = this.b,
            c = this.c,
            d = this.d;

        let shapeForward = new THREE.Vector3(0, 1, 0);
        let shapeUp = new THREE.Vector3(0, 0, 1);
        let shapeRight = new THREE.Vector3(1, 0, 0);

        // Angular constraints

        if (c >= Math.PI / 2 && d <= Math.PI / 2 || c <= Math.PI / 2 && d >= Math.PI / 2) {
            console.warn("Constraint failed: c, d < or > 90 deg");
            return;
        }

        let shapeDirection = a + c <= Math.PI;

        if (shapeDirection && Math.abs(a + c - b - d) >= EPSILON
            || !shapeDirection && Math.abs(a + (Math.PI - c) - b - (Math.PI - d)) >= EPSILON) {
            console.warn("Constraint failed: a + c = b + d; angles on the left = angles on the right");
            return;
        }

        // TODO: Derive constraint for max open angle when > 180 deg

        // Set up foundational vectors

        let n1 = shapeUp.clone()
            .applyAxisAngle(shapeRight, d - Math.PI / 2)
            .applyAxisAngle(shapeForward, angle / 2);
        let v1 = shapeUp.clone()
            .applyAxisAngle(shapeRight, d + b - Math.PI / 2)
            .applyAxisAngle(shapeForward, angle / 2);
        let d1 = n1.dot(v1);
        let n2 = shapeUp.clone()
            .applyAxisAngle(shapeRight, c - Math.PI / 2)
            .applyAxisAngle(shapeForward, - angle / 2);
        let v2 = shapeUp.clone()
            .applyAxisAngle(shapeRight, c + a - Math.PI / 2)
            .applyAxisAngle(shapeForward, - angle / 2);
        let d2 = n2.dot(v2);

        // this.debugLine2.geometry.vertices[1].copy(v1);
        // this.debugLine2.geometry.verticesNeedUpdate = true;
        // this.debugLine3.geometry.vertices[1].copy(v2);
        // this.debugLine3.geometry.verticesNeedUpdate = true;

        // Find planar intersection

        let cross = n1.clone().cross(n2);
        let lineDirection = cross.clone().normalize();
        let linePoint;
        if (Math.abs(cross.x) > 0.01) {
            linePoint = new THREE.Vector3(
                0,
                (n2.z * d1 - n1.z * d2) / cross.x,
                (- n2.y * d1 + n1.y * d2) / cross.x
            );
        } else if (Math.abs(cross.y) > 0.01) {
            linePoint = new THREE.Vector3(
                (n2.z * d1 - n1.z * d2) / - cross.y,
                0,
                (- n2.x * d1 + n1.x * d2) / - cross.y
            );
        } else {
            linePoint = new THREE.Vector3(
                (n2.y * d1 - n1.y * d2) / cross.z,
                (- n2.x * d1 + n1.x * d2) / cross.z,
                0
            );
        }
        // Since we are setting the origin as the origin for the working space, the linePoint may overlap the origin, failing the following computation
        if (linePoint.lengthSq() < Number.EPSILON) linePoint.add(lineDirection);

        // this.debugLine0.geometry.vertices[0].copy(linePoint.clone().add(lineDirection.clone().multiplyScalar(-10)));
        // this.debugLine0.geometry.vertices[1].copy(linePoint.clone().add(lineDirection.clone().multiplyScalar(10)));
        // this.debugLine0.geometry.verticesNeedUpdate = true;

        // Find v-fold direction

        let vectorDistanceSquared = v1.lengthSq();
        let distanceToLinePoint = linePoint.length();
        let angleBetweenLineDirectionAndOrigin = lineDirection.angleTo(linePoint.clone().negate());
        let perpendicularDistanceToLine = distanceToLinePoint * Math.sin(angleBetweenLineDirectionAndOrigin);
        let vectorDistanceToLineFoot = Math.sqrt(vectorDistanceSquared - Math.pow(perpendicularDistanceToLine, 2));
        let vectorDistanceToLinePoint =
            distanceToLinePoint * Math.cos(angleBetweenLineDirectionAndOrigin)
            + vectorDistanceToLineFoot * (shapeDirection ? 1 : -1);
        let v3 = linePoint.clone().add(lineDirection.clone().multiplyScalar(vectorDistanceToLinePoint)).normalize();

        // this.debugLine1.geometry.vertices[1].copy(v3);
        // this.debugLine1.geometry.verticesNeedUpdate = true;

        // Gullies

        [
            [n1, v1, v3, false],
            [n1, v3, shapeForward, false],
            [v3, n1, n2, shapeDirection],
            [v3, n2, n1, !shapeDirection],
            [n2, v3, v2, false],
            [n2, shapeForward, v3, false]
        ].forEach(function (_, i) {

            let [gullyDirection, rightNeighborDirection, leftNeighborDirection, useSupplementaryAngle] = _;
            
            let rightNeighborToGully = rightNeighborDirection.clone()
                .add(gullyDirection.clone().multiplyScalar(- Math.cos(gullyDirection.angleTo(rightNeighborDirection))))
                .normalize();
            let leftNeighborToGully = leftNeighborDirection.clone()
                .add(gullyDirection.clone().multiplyScalar(- Math.cos(gullyDirection.angleTo(leftNeighborDirection))))
                .normalize();

            let gullyAngle = rightNeighborToGully.angleTo(leftNeighborToGully);
            if (useSupplementaryAngle) gullyAngle = 2 * Math.PI - gullyAngle;

            let gullyRight = gullyDirection.clone()
                .cross(
                    rightNeighborDirection.clone().cross(gullyDirection).normalize()
                        .add(gullyDirection.clone().cross(leftNeighborDirection).normalize())
                        .multiplyScalar(0.5)
                        .normalize()
                ).normalize();
            let gullyUp = gullyRight.clone().cross(gullyDirection).normalize();

            // Update the gully

            let gully = this.gullies[i];

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

        this.debugMesh0.geometry.vertices[1].copy(n1);
        this.debugMesh0.geometry.vertices[2].copy(v3);
        this.debugMesh0.geometry.vertices[3].copy(n2);
        this.debugMesh0.geometry.computeFaceNormals();
        this.debugMesh0.geometry.verticesNeedUpdate = true;
        this.debugMesh0.geometry.normalsNeedUpdate = true;

    }

});

export {VFold};