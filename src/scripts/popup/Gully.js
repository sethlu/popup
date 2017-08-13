
import * as THREE from "three";

// let debugLineMaterial = new THREE.LineBasicMaterial({color: 0x0000cc});

/**
 * Origin and direction in angular coordinates
 * @constructor
 */
function Gully() {

    THREE.Group.call(this);

    this.shapes = [];

    this.shapeOrigin = 0;

    this.angle = Math.PI;

    // Debug

    // this.debugLine0 = new THREE.Line(new THREE.Geometry(), debugLineMaterial);
    // this.debugLine0.position.set(0, 0, 0.01);
    // this.debugLine0.geometry.vertices.push(
    //     new THREE.Vector3(),
    //     new THREE.Vector3(0, 1, 0),
    //     // Shape Up
    //     new THREE.Vector3(0, 0.9, 0.02),
    //     new THREE.Vector3(0, 0.9, 0),
    //     new THREE.Vector3(0, 1, 0),
    //     // Shape Right
    //     new THREE.Vector3(0.1, 0.9, 0.0),
    //     new THREE.Vector3(0, 0.9, 0),
    //     new THREE.Vector3(0, 1, 0),
    //     // Shape Left
    //     new THREE.Vector3(-0.1, 0.9, 0.0),
    //     new THREE.Vector3(0, 0.9, 0),
    //     new THREE.Vector3(0, 1, 0)
    // );
    // this.add(this.debugLine0);

}

Gully.prototype = Object.assign(Object.create(THREE.Group.prototype), {

    setAngle: function (angle) {
        if (angle !== undefined) {
            this.angle = angle;
        }
    },

    interpolate: function (angle) {

        this.setAngle(angle);

        angle = this.angle;

        // Skip redundant interpolation

        if (angle === this._angle) {

            // Interpolate for each shape
            for (let shape of this.shapes) {
                shape.interpolate();
            }

            return;

        }

        this._angle = angle;

        // Interpolate shapes

        for (let shape of this.shapes) {
            shape.interpolate(angle);
        }

        // this.debugLine0.position.setY(this.shapeOrigin);
        // this.debugLine0.geometry.vertices[5].setX(0.1 * Math.sin(angle / 2));
        // this.debugLine0.geometry.vertices[5].setZ(0.1 * Math.cos(angle / 2));
        // this.debugLine0.geometry.vertices[8].setX(0.1 * Math.sin(- angle / 2));
        // this.debugLine0.geometry.vertices[8].setZ(0.1 * Math.cos(- angle / 2));
        // this.debugLine0.geometry.verticesNeedUpdate = true;

    }

});

export {Gully};