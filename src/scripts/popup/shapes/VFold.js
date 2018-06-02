
import * as THREE from "three";
import {EPSILON, VEC3_RIGHT as shapeRight, VEC3_FORWARD as shapeForward, VEC3_UP as shapeUp} from "../consts.js";
import {
    Shape,
    GULLY_0,
    GULLY_0_SUPPLEMENTARY,
    GULLY_0_OPPOSITE,
    GULLY_0_SUPPLEMENTARY_OPPOSITE,
    GULLY_1,
    GULLY_1_SUPPLEMENTARY,
    GULLY_1_OPPOSITE,
    GULLY_1_SUPPLEMENTARY_OPPOSITE,
    GULLY_2,
    GULLY_2_SUPPLEMENTARY,
    GULLY_2_OPPOSITE,
    GULLY_2_SUPPLEMENTARY_OPPOSITE
} from "./Shape.js";
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

    this.gullies = {};

    this.gullies[GULLY_0] = new Gully();
    this.gullies[GULLY_0_SUPPLEMENTARY] = new Gully();
    this.gullies[GULLY_0_OPPOSITE] = new Gully();
    this.gullies[GULLY_0_SUPPLEMENTARY_OPPOSITE] = new Gully();
    this.gullies[GULLY_1] = new Gully();
    this.gullies[GULLY_1_SUPPLEMENTARY] = new Gully();
    this.gullies[GULLY_1_OPPOSITE] = new Gully();
    this.gullies[GULLY_1_SUPPLEMENTARY_OPPOSITE] = new Gully();
    this.gullies[GULLY_2] = new Gully();
    this.gullies[GULLY_2_SUPPLEMENTARY] = new Gully();
    this.gullies[GULLY_2_OPPOSITE] = new Gully();
    this.gullies[GULLY_2_SUPPLEMENTARY_OPPOSITE] = new Gully();

    this.add.apply(this, Object.values(this.gullies));

    // this.gullies[1].debugLine0.material = this.gullies[3].debugLine0.material = this.gullies[5].debugLine0.material = new THREE.LineBasicMaterial({color: 0x00cc00});

    // Debug

    // this.debugLine0 = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xff0000}));
    // this.debugLine0.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    // this.add(this.debugLine0);
    // this.debugLine1 = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xff0000}));
    // this.debugLine1.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    // this.add(this.debugLine1);
    // this.debugLine2 = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0xff0000}));
    // this.debugLine2.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    // this.add(this.debugLine2);

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
            Object.values(this.gullies).forEach(function (gully) {
                gully.interpolate();
            });

            return;

        }

        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
        this._angle = angle;

        // Interpolation

        let interpolation = VFold.interpolate(a, b, c, d, angle);

        this.applyInterpolation(interpolation);

        // Debug

        // this.debugLine0.geometry.vertices[1].copy(interpolation.v1);
        // this.debugLine0.geometry.verticesNeedUpdate = true;
        // this.debugLine1.geometry.vertices[1].copy(interpolation.v2);
        // this.debugLine1.geometry.verticesNeedUpdate = true;
        // this.debugLine2.geometry.vertices[1].copy(interpolation.v3);
        // this.debugLine2.geometry.verticesNeedUpdate = true;

        this.debugMesh0.geometry.vertices[1].copy(interpolation.n1);
        this.debugMesh0.geometry.vertices[2].copy(interpolation.v3);
        this.debugMesh0.geometry.vertices[3].copy(interpolation.n2);
        this.debugMesh0.geometry.computeFaceNormals();
        this.debugMesh0.geometry.verticesNeedUpdate = true;
        this.debugMesh0.geometry.normalsNeedUpdate = true;

    }

});

Object.assign(VFold, {

    interpolate: function (a, b, c, d, angle) {

        // Constraints

        if (c >= Math.PI / 2 && d <= Math.PI / 2 || c <= Math.PI / 2 && d >= Math.PI / 2) {
            console.warn("Constraint failed: c, d < or > 90 deg");
            return;
        }

        let shapeDirection = c <= Math.PI / 2;

        if (shapeDirection && Math.abs(a + c - b - d) >= EPSILON
            || !shapeDirection && Math.abs(a + (Math.PI - c) - b - (Math.PI - d)) >= EPSILON) {
            console.warn("Constraint failed: a + c = b + d; angles on the left = angles on the right");
            return;
        }

        // TODO: Derive constraint for max open angle when > 180 deg

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

        // Find v-fold direction

        let vectorDistanceSquared = v1.lengthSq();
        let distanceToLinePoint = linePoint.length();
        let angleBetweenLineDirectionAndOrigin = lineDirection.angleTo(linePoint.clone().negate());
        let perpendicularDistanceToLine = distanceToLinePoint * Math.sin(angleBetweenLineDirectionAndOrigin);
        let vectorDistanceToLineFoot = Math.sqrt(Math.max(0, vectorDistanceSquared - Math.pow(perpendicularDistanceToLine, 2)));
        let vectorDistanceToLinePoint =
            distanceToLinePoint * Math.cos(angleBetweenLineDirectionAndOrigin)
            + vectorDistanceToLineFoot * (shapeDirection ? 1 : -1);
        let v3 = linePoint.clone().add(lineDirection.clone().multiplyScalar(vectorDistanceToLinePoint)).normalize();

        // Gullies

        let gullyPosition = new THREE.Vector3(0, 0, 0);

        let gullies = [
            [n1, v1, v3],
            [v3, n1, n2],
            [n2, v3, v2]
        ].map(function (_) {

            let [gullyDirection, rightNeighborDirection, leftNeighborDirection] = _;

            let rightNeighborToGully = rightNeighborDirection.clone()
                .add(gullyDirection.clone().multiplyScalar(- Math.cos(gullyDirection.angleTo(rightNeighborDirection))))
                .normalize();
            let leftNeighborToGully = leftNeighborDirection.clone()
                .add(gullyDirection.clone().multiplyScalar(- Math.cos(gullyDirection.angleTo(leftNeighborDirection))))
                .normalize();

            let gullyAngle = rightNeighborToGully.angleTo(leftNeighborToGully);

            let gullyRight = gullyDirection.clone()
                .cross(
                    rightNeighborDirection.clone().cross(gullyDirection).normalize()
                        .add(gullyDirection.clone().cross(leftNeighborDirection).normalize())
                        .multiplyScalar(0.5)
                        .normalize()
                ).normalize();
            let gullyUp = gullyRight.clone().cross(gullyDirection).normalize();

            return {
                gullyPosition,
                gullyRight,
                gullyDirection,
                gullyUp,
                gullyAngle
            };

        });

        return {
            gullies,

            // Debug use
            v1, v2, v3,
            n1, n2
        };

    }

});

export {VFold};