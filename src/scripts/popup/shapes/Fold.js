
import * as THREE from "three";
import {EPSILON} from "../consts.js";
import {Shape} from "./Shape.js";
import {Gully} from "../Gully.js";
import {ParallelFold} from "./ParallelFold.js";
import {VFold} from "./VFold.js";
import {ShapeControl} from "../ShapeControl.js";

let transparentMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide});

// TODO: Warn suitable gullies to place additional shapes

function Fold(origin, a, b, c, d, e) {

    Shape.call(this);

    this.origin = origin;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;

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

        // 0
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (intersection) {
                this.origin = intersection.point.y - (this.parent ? this.parent.shapeOrigin : 0);
            }.bind(this),
            "gully"
        ),

        // 1
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (intersection) {
                this.a = intersection.point.y;
            }.bind(this)
        ),

        // 2
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (intersection) {
                this.b = intersection.point.y;
            }.bind(this)
        ),

        // 3 & 5
        function () {
            let shapeControl = new ShapeControl(
                [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
                function (intersection) {
                    this.c = intersection.point.y;
                    this.e = intersection.point.x;
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

        // 4
        new ShapeControl(
            [new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), transparentMaterial)],
            function (intersection) {
                this.d = intersection.point.y;
            }.bind(this)
        )

    ];
    this.add.apply(this, this.shapeControls);

    // Debug

    this.gullies[1].debugLine0.material = this.gullies[3].debugLine0.material = this.gullies[5].debugLine0.material = new THREE.LineBasicMaterial({color: 0x00cc00});

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
            e = this.e;
        angle = this.angle;

        // Skip redundant interpolation

        if (a === this._a
            && b === this._b
            && c === this._c
            && d === this._d
            && e === this._e
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
        this._angle = angle;

        // Constraints

        let shapeDirection = d <= 0;

        if (Math.abs(d) < EPSILON) {
            console.warn("Constraint failed: d != 0; fold diminishing point cannot be co-planar");
            return;
        }

        // Set up foundational vectors

        let shapeForward = new THREE.Vector3(0, 1, 0);
        let shapeUp = new THREE.Vector3(0, 0, 1);

        let p1 = new THREE.Vector3(b);
        let p2 = new THREE.Vector3(- a);
        let o = new THREE.Vector3(0, d, 0);

        if (isFinite(d)) {

            // V-fold

            let v1 = o.clone().multiplyScalar(-1).add(p1);
            let v2 = o.clone().multiplyScalar(-1).add(p2);

            let va, vb,
                vc = v2.angleTo(shapeForward),
                vd = v1.angleTo(shapeForward);

            let x = solveWithNewtonRaphsonMethod(function (x) {
                let y = Math.sqrt(c * c - x * x);
                let p3 = new THREE.Vector3(x, e, y);
                let v3 = o.clone().multiplyScalar(-1).add(p3);

                let va = v2.angleTo(v3);
                let vb = v1.angleTo(v3);

                if (shapeDirection) return va + vc - vb - vd;
                return va + (Math.PI - vc) - vb - (Math.PI - vd);
            });
            let y = Math.sqrt(c * c - x * x);

            let p3 = new THREE.Vector3(x, e, y);
            let v3 = o.clone().multiplyScalar(-1).add(p3);//.multiplyScalar(-d / (e - d));

            va = v2.angleTo(v3);
            vb = v1.angleTo(v3);

            let fold = new VFold(0, va, vb, vc, vd);
            fold.interpolate(angle);

            this.gullies[0].shapeOrigin = this.gullies[1].shapeOrigin = v1.length();
            this.gullies[2].shapeOrigin = this.gullies[3].shapeOrigin = v3.length();
            this.gullies[4].shapeOrigin = this.gullies[5].shapeOrigin = v2.length();

            this.gullies.forEach(function (gully, i) {

                gully.position.copy(fold.gullies[i].position.clone().add(o));
                gully.quaternion.copy(fold.gullies[i].quaternion);

                gully.interpolate(fold.gullies[i].angle);

            }, this);

        } else {

            // Parallel-fold

            // Solve sqrt((x + a)^2 + c^2 - x^2) + a = sqrt((x - b)^2 + c^2 - x^2) + b for x
            let x =
                (
                    (b >= a ? 1 : -1)
                    * Math.sqrt(
                        4 * c * c * (a * a - 2 * a * b + b * b) * (a * a + 2 * a * b + b * b)
                        + a * a * b * b * (4 * a - 4 * b) * (4 * a - 4 * b)
                    )
                    - 4 * a * a * b + 4 * a * b * b
                ) / (2 * (a * a + 2 * a * b + b * b));
            let y = Math.sqrt(c * c - x * x);

            let p3 = new THREE.Vector3(x, 0, y);

            let fold = new ParallelFold(0, a, b, p2.distanceTo(p3), p1.distanceTo(p3));
            fold.interpolate(angle);

            this.gullies.forEach(function (gully, i) {

                gully.position.copy(fold.gullies[i].position);
                gully.quaternion.copy(fold.gullies[i].quaternion);

                gully.interpolate(fold.gullies[i].angle);

            }, this);

        }

        // Shape controls

        let c1 = shapeUp.clone()
            .applyAxisAngle(shapeForward, angle / 2)
            .multiplyScalar(b);
        let c3 = shapeUp.clone().multiplyScalar(c)
            .add(shapeForward.clone().multiplyScalar(e));
        let c2 = shapeUp.clone()
            .applyAxisAngle(shapeForward, - angle / 2)
            .multiplyScalar(a);

        // 1
        {
            let shapeControl = this.shapeControls[1];

            shapeControl.handle.position.set(0, a, 0);

            let positionNormalized = c2.clone().normalize();
            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                0, 1, 0, 0,
                positionNormalized.x, 0, positionNormalized.z, 0,
                positionNormalized.z, 0, - positionNormalized.x, 0,
                0, 0, 0, 1
            ];
            shapeControl.setRotationFromMatrix(rotationMatrix);
        }

        // 2
        {
            let shapeControl = this.shapeControls[2];

            shapeControl.handle.position.set(0, b, 0);

            let positionNormalized = c1.clone().normalize();
            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.elements = [
                0, -1, 0, 0,
                positionNormalized.x, 0, positionNormalized.z, 0,
                - positionNormalized.z, 0, positionNormalized.x, 0,
                0, 0, 0, 1
            ];
            shapeControl.setRotationFromMatrix(rotationMatrix);
        }

        // 3 & 5
        {
            let shapeControl = this.shapeControls[3];

            shapeControl.handle.position.set(e, c, 0);
        }

        // 4
        {
            let shapeControl = this.shapeControls[4];

            shapeControl.handle.position.set(0, d, 0);
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

export {Fold};
