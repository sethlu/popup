import * as THREE from "three";
import * as DAT from "dat.gui";
import * as OrbitControls from "three-orbitcontrols";
import * as Stats from "stats.js";
import * as TWEEN from "@tweenjs/tween.js";
import {Base, Fold, Shape, ShapeControls} from "./popup/popup"

// Model

let base = new Base();

let fold = new Fold(
    0,
    1, 0,
    1, 0,
    1, 0,
    0
);
base.gullies[0].shapes.push(fold);
base.gullies[0].add(fold);

let fold2 = new Fold(
    0.5,
    1, 0,
    1, 0,
    1, 0,
    0
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
    let spotLight = new THREE.SpotLight(0xffffff, 0.5, 30, Math.PI / 4);
    spotLight.position.set(-1, -1, 20);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);

    // Stats

    let stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    // Variables

    let vars: any = {
        angle: 180
    };
    let gui = new DAT.GUI();
    gui.add(vars, "angle", 0, 360);

    // Interactions

    let shapeControls = new ShapeControls(camera, renderer.domElement);
    shapeControls.shapes = [base, fold, fold2];

    (function () {

        function updateTarget(shape?: Shape) {
            orbitControls.target.copy((shape || base).getWorldPosition(new THREE.Vector3()));
            orbitControls.update();
        }

        shapeControls.addEventListener("select", function (event: any) {
            updateTarget(event.shape);
        });

        shapeControls.addEventListener("start", function () {
            orbitControls.enabled = false;
        });

        shapeControls.addEventListener("end", function (event: any) {
            orbitControls.enabled = true;

            updateTarget(event.shape);
        });

    })();

    // Render loop

    (function render(time?: number) {

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
