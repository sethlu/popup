import * as THREE from "three";

export const SHAPE_PLANE_RIGHT = 0b0;
export const SHAPE_PLANE_LEFT  = 0b1;

let debugPlaneMaterial = new THREE.MeshLambertMaterial({color: 0x00ffff, shading: THREE.SmoothShading, side: THREE.DoubleSide});

export function ShapePlane(shapePlaneType) {

    THREE.Group.call(this);

    Object.defineProperty(this, "shapePlaneType", {
        value: shapePlaneType,
        writable: false
    });

    this.debugMesh0 = new THREE.Mesh(new THREE.Geometry(), debugPlaneMaterial);
    this.debugMesh0.geometry.vertices.push(
        new THREE.Vector3(-2),
        new THREE.Vector3(2),
        new THREE.Vector3(-2, 2),
        new THREE.Vector3(2, 2));
    this.debugMesh0.geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(1, 2, 3));
    this.debugMesh0.geometry.computeFaceNormals();

    this.add(this.debugMesh0);

}

ShapePlane.prototype = Object.assign(Object.create(THREE.Group.prototype), {

    /**
     * Callbacks on every gully that touches the plane.
     * @param callback
     */
    walkGullies: function (callback, filter = ~0) {
        this.parent.walkGullies(function (gully) {
            if ((gully.gullyType & filter) == gully.gullyType &&
                Object.values(gully.getSidePlanes()).includes(this))
                callback(gully);
        }.bind(this));
    },

    getRayIntersectGully: function (ray, intersect, filter = ~0) {
        const planeDirection = new THREE.Vector3(0, 0, 1);
        this.getWorldDirection(planeDirection);

        const front = planeDirection.angleTo(ray.direction) > Math.PI / 2;
        let gullies = [];

        this.walkGullies(function (gully) {
            const gullyUp = new THREE.Vector3(0, 0, 1);
            gully.getWorldDirection(gullyUp);

            if (gullyUp.angleTo(planeDirection) < Math.PI / 2 == front &&
                gullyUp.dot(intersect.point.clone().sub(gully.getWorldPosition())) > 0) {
                gullies.push(gully);
            }
        }, filter);

        gullies = gullies.map(gully => {
            let line = gully.getLine();
            return [line.distanceSqToPoint(intersect.point), gully];
        })
            .sort((a, b) => a[0] - b[0]);

        if (gullies.length > 0) {
            return gullies[0][1];
        }
    }

});
