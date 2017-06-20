
import * as THREE from "three";

function Shape() {

    THREE.Group.call(this);

}

Shape.prototype = Object.assign(Object.create(THREE.Group.prototype), {

    interpolate: function (angle = Math.PI) {

    }

});

export {Shape};