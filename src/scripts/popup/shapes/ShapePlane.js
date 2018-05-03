
import * as THREE from "three";

let debugPlaneMaterial = new THREE.MeshLambertMaterial({color: 0x00ffff, shading: THREE.SmoothShading, side: THREE.DoubleSide});

function ShapePlane() {

    THREE.Group.call(this);

    this.debugMesh0 = new THREE.Mesh(new THREE.Geometry(), debugPlaneMaterial);
    this.debugMesh0.geometry.vertices.push(
        new THREE.Vector3(-2),
        new THREE.Vector3(2),
        new THREE.Vector3(-2, 2),
        new THREE.Vector3(2, 2));
    this.debugMesh0.geometry.faces.push(new THREE.Face3(0, 1, 2), new THREE.Face3(1, 2, 3));
    this.debugMesh0.geometry.computeFaceNormals();

    this.add(this.debugMesh0);

}

ShapePlane.prototype = Object.assign(Object.create(THREE.Group.prototype), {

});

export {ShapePlane};
