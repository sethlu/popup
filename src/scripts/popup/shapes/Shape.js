
import * as THREE from "three";

function Shape() {

    THREE.Group.call(this);

    this.angle = Math.PI;

}

Shape.prototype = Object.assign(Object.create(THREE.Group.prototype), {

    setAngle: function (angle) {
        if (angle !== undefined) {
            this.angle = angle;
        }
    },

    interpolate: function (angle) {

    }

});

export {Shape};