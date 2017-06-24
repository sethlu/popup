
import * as THREE from "three";
import {EPSILON} from "../consts.js";
import {Shape} from "./Shape.js";
import {Gully} from "../Gully.js";
import {ParallelFold} from "./ParallelFold.js";
import {VFold} from "./VFold.js";

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

}

Fold.prototype = Object.assign(Object.create(Shape.prototype), {

    interpolate: function (angle = Math.PI) {

        this.position.set(0, this.origin, 0);

        // Interpolate gullies

        let a = this.a,
            b = this.b,
            c = this.c,
            d = this.d,
            e = this.e;

        // Constraints

        let shapeDirection = d <= 0;

        if (Math.abs(d) < EPSILON) {
            console.warn("Constraint failed: d != 0; fold diminishing point cannot be co-planar");
            return;
        }

        // Set up foundational vectors

        let shapeForward = new THREE.Vector3(0, 1, 0);

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

                gully.interpolate(fold.gullies[i]._angle);

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

            let p3 = new THREE.Vector3(x, 0, Math.sqrt(c * c - x * x));

            let fold = new ParallelFold(0, a, b, p2.distanceTo(p3), p1.distanceTo(p3));
            fold.interpolate(angle);

            this.gullies.forEach(function (gully, i) {

                gully.position.copy(fold.gullies[i].position);
                gully.quaternion.copy(fold.gullies[i].quaternion);

                gully.interpolate(fold.gullies[i]._angle);

            }, this);

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
