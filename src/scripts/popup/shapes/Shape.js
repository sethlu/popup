
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

    applyInterpolation: function () {

        let gullyRotationMatrix = new THREE.Matrix4();

        function applyGullyInterpolation(gullyInterpolation, i) {

            let gully = this.gullies[i],
                {gullyPosition, gullyRight, gullyDirection, gullyUp, gullyAngle, shapeOrigin} = gullyInterpolation;

            gully.position.copy(gullyPosition);

            gullyRotationMatrix.elements = [
                gullyRight.x, gullyRight.y, gullyRight.z, 0,
                gullyDirection.x, gullyDirection.y, gullyDirection.z, 0,
                gullyUp.x, gullyUp.y, gullyUp.z, 0,
                0, 0, 0, 1
            ];
            gully.setRotationFromMatrix(gullyRotationMatrix);

            gully.updateMatrix();

            gully.shapeOrigin = shapeOrigin || 0;

            gully.interpolate(gullyAngle);

        }

        return function (interpolation) {

            if (!interpolation) return;

            interpolation.gullies.forEach(applyGullyInterpolation, this);

        };

    }(),

    interpolate: function (angle) {

    }

});

export {Shape};