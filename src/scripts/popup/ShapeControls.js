
import * as THREE from "three";
import TWEEN from "tween.js";
import {BACKGROUND_OPACITY, ARROW_OPACITY} from "./ShapeControl.js";
import {EPSILON} from "./consts";

function ShapeControls(camera, domElement) {

    this.camera = camera;
    this.domElement = domElement;
    this.shapes = [];
    this.activeShape = null;

    this.enabled = true;

    // Internals

    let scope = this;

    let startEvent = {type: "start"};
    let endEvent = {type: "end"};

    let start = new THREE.Vector2();
    let end = new THREE.Vector2();

    let activeShapeControl = null;

    let rayCaster = new THREE.Raycaster();
    rayCaster.linePrecision = 1;

    function attachMouseMoveAndUpListeners() {
        scope.domElement.addEventListener("mousemove", onMouseMove);
        scope.domElement.addEventListener("mouseup", onMouseUp);
    }

    function detachMouseMoveAndUpListeners() {
        scope.domElement.removeEventListener("mousemove", onMouseMove);
        scope.domElement.removeEventListener("mouseup", onMouseUp);
    }

    function attachTouchMoveAndEndListeners() {
        scope.domElement.addEventListener("touchmove", onTouchMove);
        scope.domElement.addEventListener("touchend", onTouchEnd);
    }

    function detachTouchMoveAndEndListeners() {
        scope.domElement.removeEventListener("touchmove", onTouchMove);
        scope.domElement.removeEventListener("touchend", onTouchEnd);
    }

    function handleStart() {

        if (scope.activeShape) {

            // Find shape control intersection

            rayCaster.setFromCamera(start, scope.camera);
            let intersects = rayCaster.intersectObjects(scope.activeShape.shapeControls.map(function (shapeControl) {
                return shapeControl.handle.background;
            }));

            if (intersects.length > 0) {
                // Found intersection with a shape control

                let intersect = intersects[0];

                activeShapeControl = intersect.object.parent.parent;

                scope.activeShape.shapeControls.forEach(function (shapeControl) {
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

                scope.dispatchEvent(startEvent);

            }

        }

    }

    function onMouseDown(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        start.set(
            event.clientX / scope.domElement.offsetWidth * 2 - 1,
            - (event.clientY / scope.domElement.offsetHeight * 2 - 1)
        );

        end.copy(start); // Reset end position

        // Shared start handler

        handleStart();

        // Event listeners

        attachMouseMoveAndUpListeners();

    }

    function onTouchStart(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        if (event.touches.length === 1) {

            start.set(
                event.touches[0].clientX / scope.domElement.offsetWidth * 2 - 1,
                - (event.touches[0].clientY / scope.domElement.offsetHeight * 2 - 1)
            );

            end.copy(start); // Reset end position

            // Shared start handler

            handleStart();

            // Event listeners

            attachTouchMoveAndEndListeners();

        }

    }

    function handleMove() {

        if (activeShapeControl) {

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

            let point = referenceObject.worldToLocal(new THREE.Vector3(intersect.point.x, intersect.point.y, intersect.point.z));
            activeShapeControl.func(point);

        }

    }

    function onMouseMove(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        end.set(
            event.clientX / scope.domElement.offsetWidth * 2 - 1,
            - (event.clientY / scope.domElement.offsetHeight * 2 - 1)
        );

        // Shared move handler

        handleMove();

    }

    function onTouchMove(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        end.set(
            event.touches[0].clientX / scope.domElement.offsetWidth * 2 - 1,
            - (event.touches[0].clientY / scope.domElement.offsetHeight * 2 - 1)
        );

        // Shared move handler

        handleMove();

    }

    function handleEnd() {

        if (activeShapeControl) {

            scope.dispatchEvent(endEvent);

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

        } else if (end.distanceToSquared(start) < EPSILON) { // The circle is a little distorted with normalized screen space

            if (scope.shapes.length > 0) {

                rayCaster.setFromCamera(end, scope.camera);
                let intersects = rayCaster.intersectObjects(
                    flattenArray(scope.shapes.map(function (shape) {
                        return shape.planes.map(function (plane) { return plane.children; });
                    })));

                if (intersects.length > 0) {
                    // Found available shape for manipulation

                    let intersect = intersects[0];

                    scope.activeShape = intersect.object.parent.parent;

                } else {

                    scope.activeShape = null;

                }

                for (let shape of scope.shapes) {
                    for (let shapeControl of shape.shapeControls) {
                        shapeControl.visible = shape === scope.activeShape;
                    }
                }

                scope.update(true); // Force update control handles

            }

        }

    }

    function onMouseUp(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        // Event listeners

        detachMouseMoveAndUpListeners();

        // Shared end handler

        handleEnd();

    }

    function onTouchEnd(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        // Event listeners

        detachTouchMoveAndEndListeners();

        // Shared end handler

        handleEnd();

    }

    scope.domElement.addEventListener("mousedown", onMouseDown);

    scope.domElement.addEventListener("touchstart", onTouchStart);

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

        return function (force = false) {
            let camera = this.camera;
            let cameraNotUpdated = !isUpdated(camera);

            let factor = 32 / this.domElement.offsetHeight;
            let worldProjectionMatrix = new THREE.Matrix4();
            worldProjectionMatrix.multiplyMatrices(camera.projectionMatrix, worldProjectionMatrix.getInverse(camera.matrixWorld));

            if (this.activeShape) this.activeShape.shapeControls.forEach(function (shapeControl) {
                let handle = shapeControl.handle;

                if (cameraNotUpdated && !isUpdated(handle) && !force) return;

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

function flattenArray(a) {
    if (!Array.isArray(a)) return [a];
    return a.reduce(function (a, v) {
        Array.prototype.push.apply(a, flattenArray(v));
        return a;
    }, []);
}

export {ShapeControls};