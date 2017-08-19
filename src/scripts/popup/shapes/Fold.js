
import * as THREE from "three";
import {EPSILON} from "../consts.js";
import {Shape} from "./Shape.js";
import {Gully} from "../Gully.js";
import {ParallelFold} from "./ParallelFold.js";
import {VFold} from "./VFold.js";
import {ShapeControl} from "../ShapeControl.js";

let transparentMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide});

let debugMeshMaterial = new THREE.MeshLambertMaterial({color: 0xcc00cc, shading: THREE.SmoothShading, side: THREE.DoubleSide});

// TODO: Warn suitable gullies to place additional shapes

function Fold(origin, a, b, c, d, e, f, g) {

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

    this.gullies = [
        new Gully(),
        new Gully(),
        new Gully(),
        new Gully(),
        new Gully(),
        new Gully()
    ];
    this.add.apply(this, this.gullies);

    // Controls

    this.shapeControls = [

        // origin
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (point) {
                this.origin = Math.round((point.y - (this.parent ? this.parent.shapeOrigin : 0)) * 2) / 2;
            }.bind(this),
            "gully"
        ),

        // a & b
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (point) {
                this.a = Math.max(Math.round(point.y * 2) / 2, 0);
                this.b = Math.round(point.x * 2) / 2;
            }.bind(this),
            undefined,
            2
        ),

        // c & d
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (point) {
                this.c = Math.max(Math.round(point.y * 2) / 2, 0);
                this.d = Math.round(point.x * 2) / 2;
            }.bind(this),
            undefined,
            2
        ),

        // e & f
        function () {
            let shapeControl = new ShapeControl(
                [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
                function (point) {
                    this.e = Math.max(Math.round(point.y * 2) / 2, 0);
                    this.f = Math.round(point.x * 2) / 2;
                }.bind(this),
                undefined,
                2
            );

            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                0, 1, 0, 0,
                0, 0, 1, 0,
                1, 0, 0, 0,
                0, 0, 0, 1
            ];
            shapeControl.setRotationFromMatrix(rotationMatrix);

            return shapeControl;
        }.bind(this)(),

        // g
        function () {
            let shapeControl = new ShapeControl(
                [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
                function (point) {
                    this.g = Math.round(Math.atan2(point.y - this.e, point.x - this.f) * (36 / Math.PI)) / (36 / Math.PI);
                }.bind(this),
                undefined,
                2
            );

            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                0, 1, 0, 0,
                0, 0, 1, 0,
                1, 0, 0, 0,
                0, 0, 0, 1
            ];
            shapeControl.setRotationFromMatrix(rotationMatrix);

            return shapeControl;
        }.bind(this)()

    ];
    this.add.apply(this, this.shapeControls);

    // Debug

    // this.gullies[1].debugLine0.material = this.gullies[3].debugLine0.material = this.gullies[5].debugLine0.material = new THREE.LineBasicMaterial({color: 0x00cc00});

    this.debugMesh0 = new THREE.Mesh(new THREE.Geometry(), debugMeshMaterial);
    this.debugMesh0.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
    this.debugMesh0.geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(1, 2, 3), new THREE.Face3(2, 3, 4), new THREE.Face3(3, 4, 5));
    this.add(this.debugMesh0);

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
            for (let gully of this.gullies) {
                gully.interpolate();
            }

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

        // Set up foundational vectors

        let shapeForward = new THREE.Vector3(0, 1, 0);
        let shapeUp = new THREE.Vector3(0, 0, 1);

        // Shape controls

        let c1 = shapeUp.clone()
            .applyAxisAngle(shapeForward, angle / 2);
        let c2 = shapeUp.clone()
            .applyAxisAngle(shapeForward, - angle / 2);

        // a & b
        {
            let shapeControl = this.shapeControls[1];

            shapeControl.handle.position.set(b, a, 0);

            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                0, 1, 0, 0,
                c2.x, 0, c2.z, 0,
                c2.z, 0, -c2.x, 0,
                0, 0, 0, 1
            ];
            shapeControl.setRotationFromMatrix(rotationMatrix);

            shapeControl.updateGrid();
        }

        // c & d
        {
            let shapeControl = this.shapeControls[2];

            shapeControl.handle.position.set(d, c, 0);

            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                0, 1, 0, 0,
                c1.x, 0, c1.z, 0,
                c1.z, 0, -c1.x, 0,
                0, 0, 0, 1
            ];
            shapeControl.setRotationFromMatrix(rotationMatrix);

            shapeControl.updateGrid();
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

        // Interpolation

        let interpolation = Fold.interpolate(a, b, c, d, e, f, g, angle);

        this.applyInterpolation(interpolation);

        // Debug

        this.gullies[0].updateMatrix();
        this.gullies[2].updateMatrix();
        this.gullies[4].updateMatrix();

        this.debugMesh0.geometry.vertices[0].copy(new THREE.Vector3(0, 2, 0).applyMatrix4(this.gullies[0].matrix));
        this.debugMesh0.geometry.vertices[1].copy(new THREE.Vector3(0, 0, 0).applyMatrix4(this.gullies[0].matrix));
        this.debugMesh0.geometry.vertices[2].copy(new THREE.Vector3(0, 2, 0).applyMatrix4(this.gullies[2].matrix));
        this.debugMesh0.geometry.vertices[3].copy(new THREE.Vector3(0, 0, 0).applyMatrix4(this.gullies[2].matrix));
        this.debugMesh0.geometry.vertices[4].copy(new THREE.Vector3(0, 2, 0).applyMatrix4(this.gullies[4].matrix));
        this.debugMesh0.geometry.vertices[5].copy(new THREE.Vector3(0, 0, 0).applyMatrix4(this.gullies[4].matrix));
        this.debugMesh0.geometry.computeFaceNormals();
        this.debugMesh0.geometry.verticesNeedUpdate = true;
        this.debugMesh0.geometry.normalsNeedUpdate = true;

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

        // Set up foundational vectors

        let shapeForward = new THREE.Vector3(0, 1, 0);

        // Case folds

        if (!isAlmostInfinite(p0.y)) {

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

            return ParallelFold.interpolate(a, c, new THREE.Vector3(-a).distanceTo(p3), new THREE.Vector3(c).distanceTo(p3), angle);

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

function isAlmostInfinite(num) {
    return Math.abs(num) > Number.MAX_SAFE_INTEGER / 2;
}

export {Fold};
