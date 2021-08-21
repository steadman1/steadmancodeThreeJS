'use strict'

import './style.css'
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as Tween from "@tweenjs/tween.js";
import { SceneManager } from './javascript/threeFuntions';
import Stats from "three/examples/jsm/libs/stats.module"
import { unhideElements, hideElements, spaceText } from './javascript/webFunctions';


const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 10000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector("#threeCanvas"),
    alpha: true,
});
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
controls.enablePan = false;
controls.maxDistance = 30;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = Three.PCFSoftShadowMap;


const globeLoadEvent = new CustomEvent("onGlobeLoad", {});

const sceneManager = new SceneManager(scene, camera);
const stats = Stats();
const raycaster = new Three.Raycaster();
let mouse = new Three.Vector2();
let isInitialized = () => sceneManager.scenes.indexOf(sceneManager.currentScene) >= 1; // true === the initial globe-zoom-into-frame animation done


function onMouseClick(event) {
    mouse.x = (event.pageX / window.innerWidth ) * 2 - 1;
    mouse.y = - (event.pageY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersections = raycaster.intersectObjects(scene.children, true);
    if (intersections.length !== 0 
        && sceneManager.scenes.indexOf(intersections[0].object.parent.name) !== -1
        && !sceneManager.switchActive
        && sceneManager.currentScene === sceneManager.scenes[1]) {
        sceneManager.switchActive = true;
        intersections[0].position = intersections[0].point;
        sceneManager.switchScene(intersections[0].object.parent.name, null, intersections[0]);
    }
}

window.addEventListener("click", onMouseClick, false);
window.addEventListener("touchstart", onMouseClick, false)
window.addEventListener("load", () => sceneManager.switchScene("init", globeLoadEvent));
window.addEventListener("resize", () => {
    spaceText();
    if (isInitialized()) {
        sceneManager.resizeCamera(true);
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
window.addEventListener("onGlobeLoad", () => {spaceText(); hideElements("loadProgressText", true); unhideElements("loadEnterText", true);})


stats.showPanel(0);
document.body.appendChild(stats.dom);

function animate() {
    requestAnimationFrame(animate);
    stats.begin();

    if (isInitialized() && sceneManager.scenes.indexOf(sceneManager.currentScene) <= 1) {
        sceneManager.initialScene.globe.scene.rotation.y += 0.0015;
    } else if (sceneManager.currentScene === sceneManager.scenes[3]) {
        sceneManager.dvdScene.dvdCollisions();
    }
    
    controls.enabled = sceneManager.orbitControls;

    if (controls.enabled) {
        controls.update();
    }

    
    
    Tween.update();
    renderer.render(scene, camera);

    stats.end();
}

animate();