
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

    // Control grid

    let gridMaterial = new THREE.MeshBasicMaterial({color: 0xdddddd, side: THREE.DoubleSide});

    let grid = new THREE.Mesh(undefined, gridMaterial);
    this.grid = grid;
    this.add(grid);

    // Control ranges

    this.ranges = ranges.slice();
    this.add.apply(this, ranges);

    // Control func

    this.func = func;

    // Internal

    this.visible = false;

}

ShapeControl.prototype = Object.assign(Object.create(THREE.Group.prototype), {

    updateGrid: function () {

        let properties = {};

        function isUpdated(object) {
            if (!properties[object.id]) properties[object.id] = {
                position: new THREE.Vector3(),
            };
            let prop = properties[object.id];

            let position = object.position;

            let updated = false;

            if (!prop.position.equals(position)) {
                prop.position.copy(position);
                updated = true;
            }

            return updated;
        }

        return function (major = 1, divisions = 2) {

            if (!isUpdated(this.handle)) return;

            let x = this.handle.position.x,
                y = this.handle.position.y;

            let vertices = [], indices = [];
            let numberOfVertices = 0;

            let geometry = new THREE.Geometry();

            function buildLineY(x, y) {
                let cylinderBufferGeometry = new THREE.CylinderBufferGeometry(0.01, 0.01, Math.abs(x) + 2 / divisions, 4);

                cylinderBufferGeometry.rotateZ(-Math.PI / 2);
                cylinderBufferGeometry.translate(x / 2, y, 0);

                let cylinderGeometry = new THREE.Geometry();
                cylinderGeometry.fromBufferGeometry(cylinderBufferGeometry);

                geometry.merge(cylinderGeometry);
            }

            function buildLineX(x, y) {
                let cylinderBufferGeometry = new THREE.CylinderBufferGeometry(0.01, 0.01, Math.abs(y) + 2 / divisions, 4);

                cylinderBufferGeometry.translate(x, y / 2, 0);

                let cylinderGeometry = new THREE.Geometry();
                cylinderGeometry.fromBufferGeometry(cylinderBufferGeometry);

                geometry.merge(cylinderGeometry);
            }

            function buildPoint(x, y) {
                let sphereBufferGeometry = new THREE.SphereBufferGeometry(0.05, 4, 2);

                sphereBufferGeometry.translate(x, y, 0);

                let sphereGeometry = new THREE.Geometry();
                sphereGeometry.fromBufferGeometry(sphereBufferGeometry);

                geometry.merge(sphereGeometry);
            }

            for (let j = 0, stepj = (y > 0 ? 1 : -1) / divisions, nj = Math.ceil(Math.abs(y * divisions)); j <= nj; ++j) {
                buildLineY(x, stepj * j);

                for (let i = 0, stepi = (x > 0 ? 1 : -1) / divisions, ni = Math.ceil(Math.abs(x * divisions)); i <= ni; ++i) {
                    if (i % divisions === 0 && j % divisions === 0) {
                        buildPoint(stepi * i, stepj * j);
                    }
                }
            }
            for (let i = 0, stepi = (x > 0 ? 1 : -1) / divisions, ni = Math.ceil(Math.abs(x * divisions)); i <= ni; ++i) {
                buildLineX(stepi * i, y);
            }

            this.grid.geometry = geometry;
            this.grid.geometryNeedsUpdate = true;

        }

    }()

});

export {ShapeControl, BACKGROUND_OPACITY, ARROW_OPACITY};
