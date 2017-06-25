
import * as THREE from "three";

let shapeControlMaterial = new THREE.MeshBasicMaterial({color: 0xffd800, shading: THREE.SmoothShading});

function ShapeControl(ranges, func, referenceSpace = "shape") {

    THREE.Mesh.call(
        this,
        new THREE.SphereGeometry(0.1),
        shapeControlMaterial
    );

    this.referenceSpace = referenceSpace;

    // Control ranges

    this.ranges = [];
    this.add.apply(this, ranges);

    // Control func

    this.func = func;

}

ShapeControl.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {

    add: function (object) {

        THREE.Mesh.prototype.add.apply(this, arguments);

        if (object instanceof THREE.Object3D) {
            this.ranges.push(object);
        }

    }

});

export {ShapeControl};
