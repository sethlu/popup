
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

    this.ranges = ranges.slice();
    this.add.apply(this, ranges);

    // Control func

    this.func = func;

}

ShapeControl.prototype = Object.assign(Object.create(THREE.Group.prototype), {

});

export {ShapeControl};
