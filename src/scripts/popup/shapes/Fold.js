import * as THREE from "three";
import {EPSILON, VEC3_FORWARD as shapeForward, VEC3_UP as shapeUp, VEC3_RIGHT as shapeRight} from "../consts";
import {
    Shape,
    GULLY_0,
    GULLY_0_EXPLEMENTARY,
    GULLY_0_SUPPLEMENTARY,
    GULLY_0_SUPPLEMENTARY_EXPLEMENTARY,
    GULLY_0_OPPOSITE,
    GULLY_0_OPPOSITE_EXPLEMENTARY,
    GULLY_0_SUPPLEMENTARY_OPPOSITE,
    GULLY_0_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY,
    GULLY_1,
    GULLY_1_EXPLEMENTARY,
    GULLY_1_SUPPLEMENTARY,
    GULLY_1_SUPPLEMENTARY_EXPLEMENTARY,
    GULLY_1_OPPOSITE,
    GULLY_1_OPPOSITE_EXPLEMENTARY,
    GULLY_1_SUPPLEMENTARY_OPPOSITE,
    GULLY_1_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY,
    GULLY_2,
    GULLY_2_EXPLEMENTARY,
    GULLY_2_SUPPLEMENTARY,
    GULLY_2_SUPPLEMENTARY_EXPLEMENTARY,
    GULLY_2_OPPOSITE,
    GULLY_2_OPPOSITE_EXPLEMENTARY,
    GULLY_2_SUPPLEMENTARY_OPPOSITE,
    GULLY_2_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY
} from "./Shape";
import {SHAPE_PLANE_RIGHT, SHAPE_PLANE_LEFT} from './ShapePlane';
import {Gully} from "../Gully";
import {ParallelFold} from "./ParallelFold";
import {VFold} from "./VFold";
import {ShapeControl} from "../ShapeControl";
import {ShapePlane} from "./ShapePlane";
import {FLAG_ADAPTIVE_SHAPE_CONTROL_GRID} from "../flags";

const transparentMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide});

// const debugMeshMaterial = new THREE.MeshLambertMaterial({color: 0xcc00cc, shading: THREE.SmoothShading, side: THREE.DoubleSide});

// TODO: Warn suitable gullies to place additional shapes

export function Fold(origin, a, b, c, d, e, f, g) {

    Shape.call(this);

    this.origin = origin;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    this.g = g;

    // Gullies

    this.gullies = {};

    this.gullies[GULLY_0] = new Gully(GULLY_0);
    this.gullies[GULLY_0_EXPLEMENTARY] = new Gully(GULLY_0_EXPLEMENTARY);
    this.gullies[GULLY_0_SUPPLEMENTARY] = new Gully(GULLY_0_SUPPLEMENTARY);
    this.gullies[GULLY_0_SUPPLEMENTARY_EXPLEMENTARY] = new Gully(GULLY_0_SUPPLEMENTARY_EXPLEMENTARY);
    this.gullies[GULLY_0_OPPOSITE] = new Gully(GULLY_0_OPPOSITE);
    this.gullies[GULLY_0_OPPOSITE_EXPLEMENTARY] = new Gully(GULLY_0_OPPOSITE_EXPLEMENTARY);
    this.gullies[GULLY_0_SUPPLEMENTARY_OPPOSITE] = new Gully(GULLY_0_SUPPLEMENTARY_OPPOSITE);
    this.gullies[GULLY_0_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY] = new Gully(GULLY_0_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY);
    this.gullies[GULLY_1] = new Gully(GULLY_1);
    this.gullies[GULLY_1_EXPLEMENTARY] = new Gully(GULLY_1_EXPLEMENTARY);
    this.gullies[GULLY_1_SUPPLEMENTARY] = new Gully(GULLY_1_SUPPLEMENTARY);
    this.gullies[GULLY_1_SUPPLEMENTARY_EXPLEMENTARY] = new Gully(GULLY_1_SUPPLEMENTARY_EXPLEMENTARY);
    this.gullies[GULLY_1_OPPOSITE] = new Gully(GULLY_1_OPPOSITE);
    this.gullies[GULLY_1_OPPOSITE_EXPLEMENTARY] = new Gully(GULLY_1_OPPOSITE_EXPLEMENTARY);
    this.gullies[GULLY_1_SUPPLEMENTARY_OPPOSITE] = new Gully(GULLY_1_SUPPLEMENTARY_OPPOSITE);
    this.gullies[GULLY_1_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY] = new Gully(GULLY_1_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY);
    this.gullies[GULLY_2] = new Gully(GULLY_2);
    this.gullies[GULLY_2_EXPLEMENTARY] = new Gully(GULLY_2_EXPLEMENTARY);
    this.gullies[GULLY_2_SUPPLEMENTARY] = new Gully(GULLY_2_SUPPLEMENTARY);
    this.gullies[GULLY_2_SUPPLEMENTARY_EXPLEMENTARY] = new Gully(GULLY_2_SUPPLEMENTARY_EXPLEMENTARY);
    this.gullies[GULLY_2_OPPOSITE] = new Gully(GULLY_2_OPPOSITE);
    this.gullies[GULLY_2_OPPOSITE_EXPLEMENTARY] = new Gully(GULLY_2_OPPOSITE_EXPLEMENTARY);
    this.gullies[GULLY_2_SUPPLEMENTARY_OPPOSITE] = new Gully(GULLY_2_SUPPLEMENTARY_OPPOSITE);
    this.gullies[GULLY_2_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY] = new Gully(GULLY_2_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY);

    this.add.apply(this, Object.values(this.gullies));

    // Shape planes

    this.planes = {};

    this.planes[SHAPE_PLANE_RIGHT] = new ShapePlane(SHAPE_PLANE_RIGHT);
    this.planes[SHAPE_PLANE_LEFT] = new ShapePlane(SHAPE_PLANE_LEFT);

    this.add.apply(this, Object.values(this.planes));

    // Controls

    this.shapeControls = [

        // origin
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (point) {
                this.origin = Math.round((point.y - (this.parent ? this.parent.shapeOrigin : 0)) * 4) / 4;
            }.bind(this),
            "gully"
        ),

        // a & b
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (point) {
                this.a = Math.max(Math.round(point.y * 4) / 4, 0);
            }.bind(this)
        ),

        // c & d
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (point) {
                this.c = Math.max(Math.round(point.y * 4) / 4, 0);
            }.bind(this)
        ),

        // e & f
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (point) {
                this.e = Math.max(Math.round(point.y * 4) / 4, 0);
                this.f = Math.round(point.x * 4) / 4;
            }.bind(this),
            undefined,
            2
        ),

        // g
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (point) {
                this.g = Math.round(Math.atan2(Math.max(0, point.y - this.e), point.x - this.f) * (360 / Math.PI)) / (360 / Math.PI);
            }.bind(this),
            undefined,
            2,
            false
        )

    ];
    this.add.apply(this, this.shapeControls);

    // Debug

    // this.gullies[1].debugLine0.material = this.gullies[3].debugLine0.material = this.gullies[5].debugLine0.material = new THREE.LineBasicMaterial({color: 0x00cc00});

    // this.debugMesh0 = new THREE.Mesh(new THREE.Geometry(), debugMeshMaterial);
    // this.debugMesh0.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
    // this.debugMesh0.geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(1, 2, 3), new THREE.Face3(2, 3, 4), new THREE.Face3(3, 4, 5));
    // this.add(this.debugMesh0);

}

Fold.prototype = Object.assign(Object.create(Shape.prototype), {

    interpolate: function (angle) {

        // Set position origin

        this.position.set(0, this.origin + (this.parent ? this.parent.shapeOrigin : 0), 0);

        // Interpolate gullies

        this.setAngle(angle);

        let a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e,
            f = this.f,
            g = this.g;
        angle = this.angle;

        // Skip redundant interpolation

        if (a === this._a
            && b === this._b
            && c === this._c
            && d === this._d
            && e === this._e
            && f === this._f
            && g === this._g
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
        this._e = e;
        this._f = f;
        this._g = g;
        this._angle = angle;

        // Interpolation

        let interpolation = Fold.interpolate(a, b, c, d, e, f, g, angle);

        if (!interpolation) return;

        // Shape controls

        let c1 = shapeUp.clone()
            .applyAxisAngle(shapeForward, angle / 2);
        let c2 = shapeUp.clone()
            .applyAxisAngle(shapeForward, - angle / 2);

        // a & b
        {
            let shapeControl = this.shapeControls[1];

            shapeControl.handle.position.set(b, a, 0);
            shapeControl.updateGrid();

            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                0, 1, 0, 0,
                c2.x, 0, c2.z, 0,
                c2.z, 0, -c2.x, 0,
                0, 0, 0, 1
            ];
            shapeControl.setRotationFromMatrix(rotationMatrix);
        }

        // c & d
        {
            let shapeControl = this.shapeControls[2];

            shapeControl.handle.position.set(d, c, 0);
            shapeControl.updateGrid();

            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                0, 1, 0, 0,
                c1.x, 0, c1.z, 0,
                c1.z, 0, -c1.x, 0,
                0, 0, 0, 1
            ];
            shapeControl.setRotationFromMatrix(rotationMatrix);
        }

        // e & f
        {
            let shapeControl = this.shapeControls[3];

            shapeControl.handle.position.set(f, e, 0);
            shapeControl.updateGrid();
        }

        // g
        {
            let shapeControl = this.shapeControls[4];

            shapeControl.handle.position.set(f + Math.cos(g) * 0.5, e + Math.sin(g) * 0.5, 0);
            shapeControl.updateGrid();
        }

        // e & f & g
        {
            let gridX = shapeForward;
            let gridZ = FLAG_ADAPTIVE_SHAPE_CONTROL_GRID
                ? shapeForward.clone().cross(
                    interpolation.gullies[1].gullyPosition.clone()
                        .add(interpolation.gullies[1].gullyDirection)).normalize()
                : shapeRight;
            let gridY = gridZ.clone().cross(gridX);

            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                gridX.x, gridX.y, gridX.z, 0,
                gridY.x, gridY.y, gridY.z, 0,
                gridZ.x, gridZ.y, gridZ.z, 0,
                0, 0, 0, 1
            ];

            [
                this.shapeControls[3],
                this.shapeControls[4]
            ].forEach(function (shapeControl) {
                shapeControl.setRotationFromMatrix(rotationMatrix);
            });
        }

        // Gullies

        this.applyInterpolation(interpolation);

        // Planes

        let planeRotationMatrix = new THREE.Matrix4();

        {
            let v1 = interpolation.gullies[0].gullyDirection;
            let v2 = interpolation.gullies[1].gullyPosition.clone()
                .add(interpolation.gullies[1].gullyDirection)
                .sub(interpolation.gullies[0].gullyPosition);

            let planeX = v1;
            let planeY = v2.clone().sub(v1.clone().multiplyScalar(v2.dot(v1))).normalize();
            let planeZ = planeX.clone().cross(planeY);

            planeRotationMatrix.elements = [
                planeX.x, planeX.y, planeX.z, 0,
                planeY.x, planeY.y, planeY.z, 0,
                planeZ.x, planeZ.y, planeZ.z, 0,
                0, 0, 0, 1
            ];

            this.planes[0].position.copy(new THREE.Vector3(0, this.gullies[0].shapeOrigin, 0).applyMatrix4(this.gullies[0].matrix));
            this.planes[0].setRotationFromMatrix(planeRotationMatrix);
            this.planes[0].updateMatrix();
        }

        {
            let v1 = interpolation.gullies[2].gullyDirection;
            let v2 = interpolation.gullies[1].gullyPosition.clone()
                .add(interpolation.gullies[1].gullyDirection)
                .sub(interpolation.gullies[2].gullyPosition);

            let planeX = v1.clone().multiplyScalar(-1);
            let planeY = v2.clone().sub(v1.clone().multiplyScalar(v2.dot(v1))).normalize();
            let planeZ = planeX.clone().cross(planeY);

            planeRotationMatrix.elements = [
                planeX.x, planeX.y, planeX.z, 0,
                planeY.x, planeY.y, planeY.z, 0,
                planeZ.x, planeZ.y, planeZ.z, 0,
                0, 0, 0, 1
            ];

            this.planes[1].position.copy(new THREE.Vector3(0, this.gullies[2].shapeOrigin, 0).applyMatrix4(this.gullies[2].matrix));
            this.planes[1].setRotationFromMatrix(planeRotationMatrix);
            this.planes[1].updateMatrix();
        }

        // Debug

        // this.debugMesh0.geometry.vertices[0].copy(new THREE.Vector3(0, 2, 0).applyMatrix4(this.gullies[0].matrix));
        // this.debugMesh0.geometry.vertices[1].copy(new THREE.Vector3(0, 0, 0).applyMatrix4(this.gullies[0].matrix));
        // this.debugMesh0.geometry.vertices[2].copy(new THREE.Vector3(0, 2, 0).applyMatrix4(this.gullies[2].matrix));
        // this.debugMesh0.geometry.vertices[3].copy(new THREE.Vector3(0, 0, 0).applyMatrix4(this.gullies[2].matrix));
        // this.debugMesh0.geometry.vertices[4].copy(new THREE.Vector3(0, 2, 0).applyMatrix4(this.gullies[4].matrix));
        // this.debugMesh0.geometry.vertices[5].copy(new THREE.Vector3(0, 0, 0).applyMatrix4(this.gullies[4].matrix));
        // this.debugMesh0.geometry.computeFaceNormals();
        // this.debugMesh0.geometry.verticesNeedUpdate = true;
        // this.debugMesh0.geometry.normalsNeedUpdate = true;

    }

});

Object.assign(Fold, {

    interpolate: function (a, b, c, d, e, f, g, angle) {

        let p1 = new THREE.Vector3(c, d);
        let p2 = new THREE.Vector3(-a, b);
        let p0 = new THREE.Vector3(0, f - e / Math.tan(g));

        // Constraints

        if (b >= p0.y && d <= p0.y || b <= p0.y && d >= p0.y) {
            console.warn("Constraint failed: b, d < or > p0.y");
            return;
        }

        let shapeDirection = b >= p0.y;

        // Case folds

        if (Math.abs(p0.y) < 1e3) {

            // V-fold

            let v1 = p1.clone().sub(p0),
                v2 = p2.clone().sub(p0);

            let va, vb,
                vc = v2.angleTo(shapeForward),
                vd = v1.angleTo(shapeForward);

            let x = solveWithNewtonRaphsonMethod(function (x) {
                let y = Math.sqrt(e * e - x * x);
                let v3 = new THREE.Vector3(x, f, y).sub(p0);

                let va = v2.angleTo(v3);
                let vb = v1.angleTo(v3);

                if (shapeDirection) return va + vc - vb - vd;
                return va + (Math.PI - vc) - vb - (Math.PI - vd);
            });
            let y = Math.sqrt(e * e - x * x);

            let v3 = new THREE.Vector3(x, f, y).sub(p0);

            va = v2.angleTo(v3);
            vb = v1.angleTo(v3);

            if (isNaN(va), isNaN(vb)) return;

            // Calling interpolation

            let interpolation = VFold.interpolate(va, vb, vc, vd, angle);

            if (interpolation) interpolation.gullies.forEach(function (gully, i) {
                gully.gullyPosition = gully.gullyPosition.clone().add(p0);
                gully.shapeOrigin = [v1, v3, v2][Math.floor(i / 2)].length();
            });

            return interpolation;

        } else {

            // Parallel-fold

            // Solve sqrt((x + a)^2 + e^2 - x^2) + a = sqrt((x - c)^2 + e^2 - x^2) + c for x
            let x =
                (
                    (c >= a ? 1 : -1)
                    * Math.sqrt(
                        4 * e * e * (a * a - 2 * a * c + c * c) * (a * a + 2 * a * c + c * c)
                        + a * a * c * c * (4 * a - 4 * c) * (4 * a - 4 * c)
                    )
                    - 4 * a * a * c + 4 * a * c * c
                ) / (2 * (a * a + 2 * a * c + c * c));
            let y = Math.sqrt(e * e - x * x);

            let p3 = new THREE.Vector3(x, 0, y);

            // Calling interpolation

            return ParallelFold.interpolate(
                a, c,
                new THREE.Vector3(-a).distanceTo(p3), new THREE.Vector3(c).distanceTo(p3),
                angle, shapeDirection);

        }

    }

});

function solveWithNewtonRaphsonMethod(func, x = 0, epsilon = EPSILON, delta = EPSILON, depth = 100) {
    let i = 0;
    while (Math.abs(func(x)) > epsilon && i < depth) {
        x = x - func(x) / ((func(x + delta) - func(x)) / delta);
        ++i;
    }
    return x;
}
