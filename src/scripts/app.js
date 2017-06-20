
import * as THREE from "three";
import * as DAT from "dat.gui/build/dat.gui.min.js";
import OrbitControls from "three-orbitcontrols";
import Stats from "stats.js";
import {Base, VFold, ParallelFold} from "./popup/popup.js"

// Model

let base = new Base();

let vFold = new VFold(
    0,
    Math.PI * 85 / 180,
    Math.PI * 60 / 180,
    Math.PI * 50 / 180,
    Math.PI * 75 / 180
);
base.gullies[0].shapes.push(vFold);
base.gullies[0].add(vFold);

    let vFold3 = new VFold(
        0.5,
        Math.PI * 40 / 180,
        Math.PI * 40 / 180,
        Math.PI * 40 / 180,
        Math.PI * 40 / 180
    );
    vFold.gullies[0].shapes.push(vFold3);
    vFold.gullies[0].add(vFold3);

    let parallelFold2 = new ParallelFold(
        0,
        1.5,
        1,
        1.5,
        2
    );
    vFold.gullies[4].shapes.push(parallelFold2);
    vFold.gullies[4].add(parallelFold2);

        let vFold4 = new VFold(
            0.5,
            Math.PI * 40 / 180,
            Math.PI * 40 / 180,
            Math.PI * 40 / 180,
            Math.PI * 40 / 180
        );
        parallelFold2.gullies[3].shapes.push(vFold4);
        parallelFold2.gullies[3].add(vFold4);

        let vFold5 = new VFold(
            0.5,
            Math.PI * 60 / 180,
            Math.PI * 60 / 180,
            Math.PI * 40 / 180,
            Math.PI * 40 / 180
        );
        parallelFold2.gullies[2].shapes.push(vFold5);
        parallelFold2.gullies[2].add(vFold5);

let vFold2 = new VFold(
    1.5,
    Math.PI * 90 / 180,
    Math.PI * 90 / 180,
    Math.PI * 120 / 180,
    Math.PI * 120 / 180
);
base.gullies[0].shapes.push(vFold2);
base.gullies[0].add(vFold2);

// Render

window.addEventListener("load", function () {

    // Renderer

    let renderer = new THREE.WebGLRenderer();
    renderer.antialias = true;
    renderer.setClearColor(0x888888);
    // renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Camera

    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(5, -20, 20);
    camera.up.set(0, 0, 1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Controls
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 89 / 180;

    // Scene

    let scene = new THREE.Scene();

    // Popup
    scene.add(base);

    // Ambient light
    scene.add(new THREE.AmbientLight(0xcccccc));

    // Spot Light
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

    // let raycaster = new THREE.Raycaster();
    // raycaster.linePrecision = 1;
    //
    // let mouse = new THREE.Vector2(NaN, NaN);
    //
    // renderer.domElement.addEventListener("mousemove", function (event) {
    //
    //     mouse.x = (event.clientX / renderer.domElement.offsetWidth) * 2 - 1;
    //     mouse.y = - (event.clientY / renderer.domElement.offsetHeight) * 2 + 1
    //
    // });

    // Render Loop

    (function render() {

        stats.begin();

        // Angle

        if (vars.angle !== vars._angle) {
            base.interpolate(vars.angle * Math.PI / 180);
        }
        vars._angle = vars.angle;

        // Interactions

        // if (mouse.x && mouse.y) {
        //
        //     raycaster.setFromCamera(mouse, camera);
        //     let intersects = raycaster.intersectObjects([
        //         base.gullies[0].debugLine0
        //     ]);
        //
        // }

        // Render

        renderer.render(scene, camera);

        stats.end();
        window.requestAnimationFrame(render);

    })();

});
