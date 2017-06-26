
import * as THREE from "three";

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
            return shapeControl.handle;
        }));

        if (intersects.length === 0) return;
        let intersect = intersects[0];

        activeShapeControl = intersect.object.parent;

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

        scope.domElement.removeEventListener("mousemove", onMouseMove);
        scope.domElement.removeEventListener("mouseup", onMouseUp);

        scope.dispatchEvent(endEvent);

    }

    scope.domElement.addEventListener("mousedown", onMouseDown);

}

ShapeControls.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), {

    update: function () {
        let camera = this.camera;

        camera.updateMatrixWorld();

        let factor = 32 / this.domElement.offsetHeight;

        if (this.activeShape) this.activeShape.shapeControls.forEach(function (shapeControl) {
            let scale = shapeControl.getWorldPosition().distanceTo(camera.position) * factor;
            shapeControl.handle.scale.set(scale, scale, scale);

            let o = shapeControl.localToWorld(new THREE.Vector3(0, 0, 0)).project(camera);
            let v = shapeControl.localToWorld(new THREE.Vector3(0, 1, 0)).project(camera);
            let rotv = new THREE.Vector2((v.x - o.x) * camera.aspect, v.y - o.y).angle() - Math.PI / 2;

            shapeControl.arrows[0].scale.set(scale, scale, scale);
            shapeControl.arrows[0].material.rotation = rotv;

            if (shapeControl.movement === 2) {
                let u = shapeControl.localToWorld(new THREE.Vector3(1, 0, 0)).project(camera);
                let rotu = new THREE.Vector2((u.x - o.x) * camera.aspect, u.y - o.y).angle() - Math.PI / 2;

                shapeControl.arrows[1].scale.set(scale, scale, scale);
                shapeControl.arrows[1].material.rotation = rotu;
            }

        });
    }

});

export {ShapeControls};