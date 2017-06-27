
import * as THREE from "three";

let textureLoader = new THREE.TextureLoader();

let backgroundTexture = textureLoader.load("images/shapecontrol_blank.png");
let arrowTexture = textureLoader.load("images/shapecontrol_line_arrows.png");

const BACKGROUND_OPACITY = 0.8;
const ARROW_OPACITY = 1;

function ShapeControl(ranges, func, referenceSpace = "shapeControl", movement = 1) {

    THREE.Group.call(this);

    this.referenceSpace = referenceSpace;
    this.movement = movement;

    // Control handle

    let handle = new THREE.Group();

    handle.arrows = [];
    for (let i = 0; i < movement; ++i) {
        let arrowMaterial = new THREE.SpriteMaterial({map: arrowTexture, transparent: true, opacity: ARROW_OPACITY});
        arrowMaterial.depthWrite = false;
        arrowMaterial.depthTest = false;

        let arrow = new THREE.Sprite(arrowMaterial);
        handle.arrows.push(arrow);
        handle.add(arrow);
    }

    let handleMaterial = new THREE.SpriteMaterial({map: backgroundTexture, transparent: true, opacity: BACKGROUND_OPACITY});
    handleMaterial.depthWrite = false;
    handleMaterial.depthTest = false;

    let background = new THREE.Sprite(handleMaterial);
    handle.background = background;
    handle.add(background);

    this.handle = handle;
    this.add(handle);

    // Control ranges

    this.ranges = ranges.slice();
    this.add.apply(this, ranges);

    // Control func

    this.func = func;

}

ShapeControl.prototype = Object.assign(Object.create(THREE.Group.prototype), {

});

export {ShapeControl, BACKGROUND_OPACITY, ARROW_OPACITY};
