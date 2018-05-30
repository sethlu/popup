import * as THREE from "three";

export function Line3(origin, direction) {

    this.origin = origin || new THREE.Vector3();
    this.direction = direction || new THREE.Vector3();

}

Line3.prototype = Object.assign(Line3.prototype, {

    /**
     * Slightly different implementation due to behavioral difference in the implementation by THREE.js
     * @see THREE.Ray.distanceSqToPoint
     */
    distanceSqToPoint: function () {

        let v = new THREE.Vector3();

        return function (point) {

            let directionDistance = v.subVectors(point, this.origin).dot(this.direction);
            v.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
            return v.distanceToSquared(point);

        };

    }()

});
