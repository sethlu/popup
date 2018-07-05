import * as THREE from "three";
import {Quaternion} from "three";
import {Line3} from "./math/Line3";
import {
    GULLY_0,
    GULLY_1,
    GULLY_2,
    GULLY_N_MASK,
    GULLY_EXPLEMENTARY,
    GULLY_SUPPLEMENTARY
} from "./shapes/Shape";
import {Base} from './shapes/Base';
import {SHAPE_PLANE_RIGHT, SHAPE_PLANE_LEFT} from './shapes/ShapePlane';

// let debugLineMaterial = new THREE.LineBasicMaterial({color: 0x0000cc});

/**
 * Origin and direction in angular coordinates
 * @constructor
 */
export function Gully(gullyType) {

    THREE.Group.call(this);

    Object.defineProperty(this, "gullyType", {
        value: gullyType,
        writable: false
    });

    this.shapes = [];

    this.shapeOrigin = 0;

    this.angle = Math.PI;

    // Debug

    // this.debugLine0 = new THREE.Line(new THREE.Geometry(), debugLineMaterial);
    // this.debugLine0.position.set(0, 0, 0.01);
    // this.debugLine0.geometry.vertices.push(
    //     new THREE.Vector3(),
    //     new THREE.Vector3(0, 1, 0),
    //     // Shape Up
    //     new THREE.Vector3(0, 0.9, 0.02),
    //     new THREE.Vector3(0, 0.9, 0),
    //     new THREE.Vector3(0, 1, 0),
    //     // Shape Right
    //     new THREE.Vector3(0.1, 0.9, 0.0),
    //     new THREE.Vector3(0, 0.9, 0),
    //     new THREE.Vector3(0, 1, 0),
    //     // Shape Left
    //     new THREE.Vector3(-0.1, 0.9, 0.0),
    //     new THREE.Vector3(0, 0.9, 0),
    //     new THREE.Vector3(0, 1, 0)
    // );
    // this.add(this.debugLine0);

}

Gully.prototype = Object.assign(Object.create(THREE.Group.prototype), {

    setAngle: function (angle) {
        if (angle !== undefined) {
            this.angle = angle;
        }
    },

    interpolate: function (angle) {

        this.setAngle(angle);

        angle = this.angle;

        // Skip redundant interpolation

        if (angle === this._angle) {

            // Interpolate for each shape
            for (let shape of this.shapes) {
                shape.interpolate();
            }

            return;

        }

        this._angle = angle;

        // Interpolate shapes

        for (let shape of this.shapes) {
            shape.interpolate(angle);
        }

        // this.debugLine0.position.setY(this.shapeOrigin);
        // this.debugLine0.geometry.vertices[5].setX(0.1 * Math.sin(angle / 2));
        // this.debugLine0.geometry.vertices[5].setZ(0.1 * Math.cos(angle / 2));
        // this.debugLine0.geometry.vertices[8].setX(0.1 * Math.sin(- angle / 2));
        // this.debugLine0.geometry.vertices[8].setZ(0.1 * Math.cos(- angle / 2));
        // this.debugLine0.geometry.verticesNeedUpdate = true;

    },

    getSidePlanes: function () {

        if (!this.parent) throw new Error("Require gully to be nested under a shape");

        // Base case
        if (this.parent instanceof Base) {
            return this.parent.planes;
        }

        const shape = this.parent;
        const shapePlanes = shape.planes;
        const parentGully = shape.parent;

        const sidePlanes = {};

        switch (this.gullyType & GULLY_N_MASK) {
            case GULLY_0:
                sidePlanes[SHAPE_PLANE_RIGHT] = parentGully.getSidePlanes()[SHAPE_PLANE_RIGHT];
                sidePlanes[SHAPE_PLANE_LEFT] = shapePlanes[SHAPE_PLANE_RIGHT];
                break;
            case GULLY_1:
                sidePlanes[SHAPE_PLANE_RIGHT] = shapePlanes[SHAPE_PLANE_LEFT]
                sidePlanes[SHAPE_PLANE_LEFT] = shapePlanes[SHAPE_PLANE_RIGHT];
                break;
            case GULLY_2:
                sidePlanes[SHAPE_PLANE_RIGHT] = shapePlanes[SHAPE_PLANE_LEFT];
                sidePlanes[SHAPE_PLANE_LEFT] = parentGully.getSidePlanes()[SHAPE_PLANE_LEFT];
                break;
            default:
                throw new Error("Unexpected gully");
        }

        if (this.gullyType & GULLY_EXPLEMENTARY) {
            // Flip right and left
            [sidePlanes[SHAPE_PLANE_RIGHT], sidePlanes[SHAPE_PLANE_LEFT]] =
                [sidePlanes[SHAPE_PLANE_LEFT], sidePlanes[SHAPE_PLANE_RIGHT]];
        }
        if (this.gullyType & GULLY_SUPPLEMENTARY) {
            // Flip right and left
            [sidePlanes[SHAPE_PLANE_RIGHT], sidePlanes[SHAPE_PLANE_LEFT]] =
                [sidePlanes[SHAPE_PLANE_LEFT], sidePlanes[SHAPE_PLANE_RIGHT]];
        }
        // Opposite gullies make no difference

        return sidePlanes;

    },

    addShape: function (shape) {

        if (shape.parent) throw new Error("Shape already added elsewhere");

        this.shapes.push(shape);
        this.add(shape);

        if (this._angle) {
            shape.interpolate(this._angle);
        }

    },

    getLine: function () {

        let quaternion = new Quaternion();
        let direction = new THREE.Vector3();

        return function () {

            this.getWorldQuaternion(quaternion);
            return new Line3(
                this.getWorldPosition(),
                direction.set(0, 1, 0).applyQuaternion(quaternion));

        };

    }()

});
