
import * as THREE from "three";

export const GULLY_0                        = 0b0000;
export const GULLY_0_SUPPLEMENTARY          = 0b0001;
export const GULLY_0_OPPOSITE               = 0b1000;
export const GULLY_0_SUPPLEMENTARY_OPPOSITE = 0b1001;
export const GULLY_1                        = 0b0010;
export const GULLY_1_SUPPLEMENTARY          = 0b1010;
export const GULLY_1_OPPOSITE               = 0b0011;
export const GULLY_1_SUPPLEMENTARY_OPPOSITE = 0b1011;
export const GULLY_2                        = 0b0100;
export const GULLY_2_SUPPLEMENTARY          = 0b0101;
export const GULLY_2_OPPOSITE               = 0b1100;
export const GULLY_2_SUPPLEMENTARY_OPPOSITE = 0b1101;

const GULLY_SUPPLEMENTARY                   = 0b0001;
const GULLY_OPPOSITE                        = 0b1000;

export function Shape() {

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

        function getGullyInterpolation(interpolation, i) {
            let gullyInterpolations = interpolation.gullies;

            if (i in gullyInterpolations) return gullyInterpolations[i];
            else if ((i ^ GULLY_OPPOSITE) in gullyInterpolations) {
                let interpol = gullyInterpolations[i ^ GULLY_OPPOSITE];
                return {
                    gullyPosition: interpol.gullyPosition,
                    gullyRight: interpol.gullyRight.clone().negate(),
                    gullyDirection: interpol.gullyDirection,
                    gullyUp: interpol.gullyUp.clone().negate(),
                    gullyAngle: interpol.gullyAngle,
                    shapeOrigin: interpol.shapeOrigin
                };
            } else if ((i ^ GULLY_SUPPLEMENTARY) in gullyInterpolations) {
                let interpol = gullyInterpolations[i ^ GULLY_SUPPLEMENTARY];
                return {
                    gullyPosition: interpol.gullyPosition,
                    gullyRight: interpol.gullyUp,
                    gullyDirection: interpol.gullyDirection,
                    gullyUp: interpol.gullyUp.clone().cross(interpol.gullyDirection),
                    gullyAngle: Math.PI - interpol.gullyAngle,
                    shapeOrigin: interpol.shapeOrigin
                };
            } else {
                throw new Error("Unexpected case");
            }
        }

        return function (interpolation) {

            if (!interpolation) return;

            Object.entries(this.gullies).forEach(function (entry) {
                let [i, gully] = entry;
                let {gullyPosition, gullyRight, gullyDirection, gullyUp, gullyAngle, shapeOrigin} = getGullyInterpolation(interpolation, i);

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

            }, this);

        };

    }(),

    interpolate: function (angle) {

    }

});
