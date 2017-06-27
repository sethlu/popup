
import * as THREE from "three";
import TWEEN from "tween.js";
import {BACKGROUND_OPACITY, ARROW_OPACITY} from "./ShapeControl.js";

function ShapeControls(camera, domElement) {

    this.camera = camera;
    this.domElement = domElement;
    this.activeShape = null;

    this.enabled = true;

    // Internals

    let scope = this;

    let startEvent = {type: "start"};
    let endEvent = {type: "end"};

    let start = new THREE.Vector2();
    let end = new THREE.Vector2();
    let delta = new THREE.Vector2();

    let activeShapeControl = null;

    let rayCaster = new THREE.Raycaster();
    rayCaster.linePrecision = 1;

    function onMouseDown(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        if (!scope.activeShape) return;

        start.set(
            event.clientX / scope.domElement.offsetWidth * 2 - 1,
            - (event.clientY / scope.domElement.offsetHeight * 2 - 1)
        );

        // Find intersection

        rayCaster.setFromCamera(start, scope.camera);
        let intersects = rayCaster.intersectObjects(scope.activeShape.shapeControls.map(function (shapeControl) {
            return shapeControl.handle.background;
        }));

        if (intersects.length === 0) return;
        let intersect = intersects[0];

        activeShapeControl = intersect.object.parent.parent;

        scope.activeShape.shapeControls.map(function (shapeControl) {
            let handle = shapeControl.handle;

            new TWEEN.Tween(handle.background.material).to({
                opacity: shapeControl === activeShapeControl ? BACKGROUND_OPACITY : 0
            }, 100).start();

            for (let arrow of handle.arrows) {
                new TWEEN.Tween(arrow.material).to({
                    opacity: shapeControl === activeShapeControl ? ARROW_OPACITY : 0
                }, 100).start();
            }
        });

        // Event listeners

        scope.domElement.addEventListener("mousemove", onMouseMove);
        scope.domElement.addEventListener("mouseup", onMouseUp);

        scope.dispatchEvent(startEvent);

    }

    function onMouseMove(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        end.set(
            event.clientX / scope.domElement.offsetWidth * 2 - 1,
            - (event.clientY / scope.domElement.offsetHeight * 2 - 1)
        );
        // delta.subVectors(end, start);
        // start.copy(end);

        // Find intersections

        rayCaster.setFromCamera(end, scope.camera);
        let intersects = rayCaster.intersectObjects(activeShapeControl.ranges);

        if (intersects.length === 0) return;
        let intersect = intersects[0];

        let referenceObject;
        switch (activeShapeControl.referenceSpace) {
            case "gully":
                referenceObject = scope.activeShape.parent;
                break;
            case "shape":
                referenceObject = scope.activeShape;
                break;
            case "shapeControl":
                referenceObject = activeShapeControl;
                break;
            default:
                return;
        }

        intersects.point = referenceObject.worldToLocal(new THREE.Vector3(intersect.point.x, intersect.point.y, intersect.point.z));
        activeShapeControl.func(intersects);

    }

    function onMouseUp(event) {

        if (scope.enabled === false) return;

        // Event listeners

        scope.domElement.removeEventListener("mousemove", onMouseMove);
        scope.domElement.removeEventListener("mouseup", onMouseUp);

        scope.dispatchEvent(endEvent);

        // Internals

        scope.activeShape.shapeControls.map(function (shapeControl) {
            let handle = shapeControl.handle;

            new TWEEN.Tween(handle.background.material).to({
                opacity: BACKGROUND_OPACITY
            }, 100).start();

            for (let arrow of handle.arrows) {
                new TWEEN.Tween(arrow.material).to({
                    opacity: ARROW_OPACITY
                }, 100).start();
            }
        });

        activeShapeControl = null;

    }

    scope.domElement.addEventListener("mousedown", onMouseDown);

}

ShapeControls.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), {

    update: function () {

        let properties = {};

        function isUpdated(object) {
            if (!properties[object.id]) properties[object.id] = {
                worldPosition: new THREE.Vector3(),
                worldQuaternion: new THREE.Quaternion()
            };
            let prop = properties[object.id];

            let worldPosition = object.getWorldPosition(),
                worldQuaternion = object.getWorldQuaternion();

            let updated = false;

            if (!prop.worldPosition.equals(worldPosition)) {
                prop.worldPosition.copy(worldPosition);
                updated = true;
            }

            if (!prop.worldQuaternion.equals(worldQuaternion)) {
                prop.worldQuaternion.copy(worldQuaternion);
                updated = true;
            }

            return updated;
        }

        return function () {
            let camera = this.camera;
            let cameraNotUpdated = !isUpdated(camera);

            let factor = 32 / this.domElement.offsetHeight;
            let worldProjectionMatrix = new THREE.Matrix4();
            worldProjectionMatrix.multiplyMatrices(camera.projectionMatrix, worldProjectionMatrix.getInverse(camera.matrixWorld));

            if (this.activeShape) this.activeShape.shapeControls.forEach(function (shapeControl) {
                let handle = shapeControl.handle;

                if (cameraNotUpdated && !isUpdated(handle)) return;

                let scale = handle.getWorldPosition().distanceTo(camera.position) * factor;
                handle.scale.set(scale, scale, scale);

                let o = handle.localToWorld(new THREE.Vector3(0, 0, 0)).applyMatrix4(worldProjectionMatrix);
                let v = handle.localToWorld(new THREE.Vector3(0, 1, 0)).applyMatrix4(worldProjectionMatrix);
                let rotv = new THREE.Vector2((v.x - o.x) * camera.aspect, v.y - o.y).angle() - Math.PI / 2;

                handle.arrows[0].material.rotation = rotv;

                if (shapeControl.movement === 2) {
                    let u = handle.localToWorld(new THREE.Vector3(1, 0, 0)).applyMatrix4(worldProjectionMatrix);
                    let rotu = new THREE.Vector2((u.x - o.x) * camera.aspect, u.y - o.y).angle() - Math.PI / 2;

                    handle.arrows[1].material.rotation = rotu;
                }

            });
        };

    }()

});

export {ShapeControls};