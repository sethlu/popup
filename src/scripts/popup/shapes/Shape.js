import * as THREE from "three";

export const GULLY_0                                        = 0b00000;
export const GULLY_0_EXPLEMENTARY                           = 0b10000;
export const GULLY_0_SUPPLEMENTARY                          = 0b00100;
export const GULLY_0_SUPPLEMENTARY_EXPLEMENTARY             = 0b10100;
export const GULLY_0_OPPOSITE                               = 0b01000;
export const GULLY_0_OPPOSITE_EXPLEMENTARY                  = 0b11000;
export const GULLY_0_SUPPLEMENTARY_OPPOSITE                 = 0b01100;
export const GULLY_0_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY    = 0b11100;

export const GULLY_1                                        = 0b00001;
export const GULLY_1_EXPLEMENTARY                           = 0b10001;
export const GULLY_1_SUPPLEMENTARY                          = 0b00101;
export const GULLY_1_SUPPLEMENTARY_EXPLEMENTARY             = 0b10101;
export const GULLY_1_OPPOSITE                               = 0b01001;
export const GULLY_1_OPPOSITE_EXPLEMENTARY                  = 0b11001;
export const GULLY_1_SUPPLEMENTARY_OPPOSITE                 = 0b01101;
export const GULLY_1_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY    = 0b11101;

export const GULLY_2                                        = 0b00010;
export const GULLY_2_EXPLEMENTARY                           = 0b10010;
export const GULLY_2_SUPPLEMENTARY                          = 0b00110;
export const GULLY_2_SUPPLEMENTARY_EXPLEMENTARY             = 0b10110;
export const GULLY_2_OPPOSITE                               = 0b01010;
export const GULLY_2_OPPOSITE_EXPLEMENTARY                  = 0b11010;
export const GULLY_2_SUPPLEMENTARY_OPPOSITE                 = 0b01110;
export const GULLY_2_SUPPLEMENTARY_OPPOSITE_EXPLEMENTARY    = 0b11110;

export const GULLY_N_MASK        = 0b00011;
export const GULLY_SUPPLEMENTARY = 0b00100;
export const GULLY_OPPOSITE      = 0b01000;
export const GULLY_EXPLEMENTARY  = 0b10000;

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
            if (i in interpolation.gullies) return interpolation.gullies[i];
            else if (i & GULLY_OPPOSITE) {
                let interpol = getGullyInterpolation(interpolation, i ^ GULLY_OPPOSITE);
                return {
                    gullyPosition: interpol.gullyPosition,
                    gullyRight: interpol.gullyRight.clone().negate(),
                    gullyDirection: interpol.gullyDirection,
                    gullyUp: interpol.gullyUp.clone().negate(),
                    gullyAngle: interpol.gullyAngle,
                    shapeOrigin: interpol.shapeOrigin
                };
            } else if (i & GULLY_SUPPLEMENTARY) {
                let interpol = getGullyInterpolation(interpolation, i ^ GULLY_SUPPLEMENTARY);
                return {
                    gullyPosition: interpol.gullyPosition,
                    gullyRight: interpol.gullyUp,
                    gullyDirection: interpol.gullyDirection,
                    gullyUp: interpol.gullyUp.clone().cross(interpol.gullyDirection),
                    gullyAngle: Math.PI - interpol.gullyAngle,
                    shapeOrigin: interpol.shapeOrigin
                };
            } else if (i & GULLY_EXPLEMENTARY) {
                let interpol = getGullyInterpolation(interpolation, i ^ GULLY_EXPLEMENTARY);
                return {
                    gullyPosition: interpol.gullyPosition,
                    gullyRight: interpol.gullyRight.clone().negate(),
                    gullyDirection: interpol.gullyDirection,
                    gullyUp: interpol.gullyUp.clone().negate(),
                    gullyAngle: 2 * Math.PI - interpol.gullyAngle,
                    shapeOrigin: interpol.shapeOrigin
                }
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

    },

    /**
     * Callbacks on every nested gullies.
     * @param callback
     */
    walkGullies: function (callback) {

        Object.values(this.gullies).forEach(function (gully) {
            callback(gully);

            gully.shapes.forEach(function (shape) {
                shape.walkGullies(callback);
            })
        })

    }

});
