
import * as THREE from "three";
import * as DAT from "dat.gui/build/dat.gui.min.js";
import OrbitControls from "three-orbitcontrols";
import Stats from "stats.js";
import TWEEN from "tween.js";
import {Base, Fold, VFold, ParallelFold, ShapeControls} from "./popup/popup.js"

// Model

let base = new Base();

let fold = new Fold(
    0,
    1, 1,
    1, 1,
    1, 1
);
base.gullies[0].shapes.push(fold);
base.gullies[0].add(fold);

let fold2 = new Fold(
    0.5,
    1, 1,
    1, 1,
    1, 1
);
fold.gullies[0].shapes.push(fold2);
fold.gullies[0].add(fold2);

// Render

window.addEventListener("load", function () {

    // Renderer

    let renderer = new THREE.WebGLRenderer();
    // renderer.antialias = true;
    renderer.setClearColor(0x888888);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Camera

    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(2, -15, 15);
    camera.up.set(0, 0, 1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Orbit controls
    let orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.maxPolarAngle = Math.PI * 89 / 180;

    // Scene

    let scene = new THREE.Scene();

    // Popup
    scene.add(base);

    // Ambient light
    scene.add(new THREE.AmbientLight(0xcccccc));

    // Spot light
    let spotLight = new THREE.SpotLight(0xffffff, 1, 50, Math.PI / 4);
    spotLight.position.set(-1, -1, 20);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);

    // Stats

    let stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    // Variables

    let vars = {
        angle: 180
    };
    let gui = new DAT.GUI();
    gui.add(vars, "angle", 0, 360);

    // Interactions

    let shapeControls = new ShapeControls(camera, renderer.domElement);
    shapeControls.shapes = [fold, fold2];

    shapeControls.addEventListener("start", function () {
       orbitControls.enabled = false;
    });

    shapeControls.addEventListener("end", function () {
        orbitControls.enabled = true;
    });

    // Render loop

    (function render(time) {

        stats.begin();

        // Angle

        base.interpolate(vars.angle * Math.PI / 180);
        vars._angle = vars.angle;

        // Interactions

        shapeControls.update();

        // Render

        if (time) {
            TWEEN.update(time);
        }

        renderer.render(scene, camera);

        stats.end();
        window.requestAnimationFrame(render);

    })();

});
