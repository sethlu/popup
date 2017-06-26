
import * as THREE from "three";

let textureLoader = new THREE.TextureLoader();

let blankTexture = textureLoader.load("images/shapecontrol_blank.png");
let arrowTexture = textureLoader.load("images/shapecontrol_line_arrows.png");

let handleMaterial = new THREE.SpriteMaterial({map: blankTexture, transparent: true, opacity: 0.8});
handleMaterial.depthWrite = false;
handleMaterial.depthTest = false;

function ShapeControl(ranges, func, referenceSpace = "shape", movement = 1) {

    THREE.Group.call(this);

    this.referenceSpace = referenceSpace;
    this.movement = movement;

    // Control handle

    this.arrows = [];
    for (let i = 0; i < movement; ++i) {
        let arrowMaterial = new THREE.SpriteMaterial({map: arrowTexture});
        arrowMaterial.depthWrite = false;
        arrowMaterial.depthTest = false;
        let arrow = new THREE.Sprite(arrowMaterial);

        this.arrows.push(arrow);
        this.add(arrow);
    }

    this.handle = new THREE.Sprite(handleMaterial);
    this.add(this.handle);

    // Control ranges

    this.ranges = ranges.slice();
    this.add.apply(this, ranges);

    // Control func

    this.func = func;

}

ShapeControl.prototype = Object.assign(Object.create(THREE.Group.prototype), {

});

export {ShapeControl};
