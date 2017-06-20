
import * as THREE from "three";
import {Shape} from "./Shape.js";
import {Gully} from "../Gully.js";

let debugMeshMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.SmoothShading, side: THREE.DoubleSide});

/**
 * The base for modeling
 * @constructor
 */
function Base() {

    Shape.call(this);

    this.width = 17;
    this.height = 11;

    // Gullies

    this.gullies = [
        new Gully()
    ];
    this.add.apply(this, this.gullies);

    // Debug

    this.debugMesh0 = new THREE.Mesh(new THREE.Geometry(), debugMeshMaterial);
    this.debugMesh0.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
    this.debugMesh0.geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 3, 0));
    this.add(this.debugMesh0);

    this.debugMesh1 = new THREE.Mesh(new THREE.Geometry(), debugMeshMaterial);
    this.debugMesh1.geometry.vertices.push(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
    this.debugMesh1.geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(2, 3, 0));
    this.add(this.debugMesh1);

}

Base.prototype = Object.assign(Object.create(Shape.prototype), {

    interpolate: function (angle = Math.PI) {

        // Set up foundational vectors

        let shapeForward = new THREE.Vector3(0, 1, 0);
        let shapeUp = new THREE.Vector3(0, 0, 1);
        let shapeRight = new THREE.Vector3(1, 0, 0);

        // Gullies

        let gullyDirection = shapeForward;
        let gullyUp = shapeUp;
        let gullyRight = gullyDirection.clone().cross(gullyUp).normalize();

        let gully = this.gullies[0];

        let gullyRotationMatrix = new THREE.Matrix4();
        gullyRotationMatrix.elements = [
            gullyRight.x, gullyRight.y, gullyRight.z, 0,
            gullyDirection.x, gullyDirection.y, gullyDirection.z, 0,
            gullyUp.x, gullyUp.y, gullyUp.z, 0,
            0, 0, 0, 1
        ];
        gully.setRotationFromMatrix(gullyRotationMatrix);
        gully.interpolate(angle);

        // Shapes

        this.debugMesh0.geometry.vertices[0].copy(shapeForward.clone().multiplyScalar(- this.height / 2));
        this.debugMesh0.geometry.vertices[1].copy(shapeForward.clone().multiplyScalar(- this.height / 2).add(shapeUp.clone().applyAxisAngle(shapeForward, angle / 2).multiplyScalar(this.width / 2)));
        this.debugMesh0.geometry.vertices[2].copy(shapeForward.clone().multiplyScalar(this.height / 2).add(shapeUp.clone().applyAxisAngle(shapeForward, angle / 2).multiplyScalar(this.width / 2)));
        this.debugMesh0.geometry.vertices[3].copy(shapeForward.clone().multiplyScalar(this.height / 2));
        this.debugMesh0.geometry.computeFaceNormals();
        this.debugMesh0.geometry.verticesNeedUpdate = true;
        this.debugMesh0.geometry.normalsNeedUpdate = true;

        this.debugMesh1.geometry.vertices[0].copy(shapeForward.clone().multiplyScalar(- this.height / 2));
        this.debugMesh1.geometry.vertices[1].copy(shapeForward.clone().multiplyScalar(this.height / 2));
        this.debugMesh1.geometry.vertices[2].copy(shapeForward.clone().multiplyScalar(this.height / 2).add(shapeUp.clone().applyAxisAngle(shapeForward, - angle / 2).multiplyScalar(this.width / 2)));
        this.debugMesh1.geometry.vertices[3].copy(shapeForward.clone().multiplyScalar(- this.height / 2).add(shapeUp.clone().applyAxisAngle(shapeForward, - angle / 2).multiplyScalar(this.width / 2)));
        this.debugMesh1.geometry.computeFaceNormals();
        this.debugMesh1.geometry.verticesNeedUpdate = true;
        this.debugMesh1.geometry.normalsNeedUpdate = true;

    }

});

export {Base};