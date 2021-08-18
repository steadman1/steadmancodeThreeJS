'use strict'

import './style.css'
import * as Three from "three";
import * as Tween from "@tweenjs/tween.js";
import { spaceText } from './javascript/textSpacing';
import { InitializeScene } from './javascript/threeFuntions';
import { unhideElements, hideElements } from './javascript/initializeHTML';


let isInitialized = false; // true === the initial globe-zoom-into-frame animation done

const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 10000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector("#threeCanvas"),
    alpha: true,
});

const initialScene = new InitializeScene(scene, camera);


renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = Three.PCFSoftShadowMap;

const event = new CustomEvent("onGlobeLoad", {});

initialScene.loadGlobe(event)

async function enterScene() {
    window.removeEventListener("touchmove", enterScene); 
    window.removeEventListener("wheel", enterScene); 
    initialScene.zoomToGlobe();
    isInitialized = true;
    await new Promise(i => setTimeout(async () => {
        hideElements("loadEnterText");
        await new Promise(j => setTimeout(() => {
            unhideElements("nameContainer");
        }, 2300));
    }, 5000));
}


initialScene.lightingSetup();
initialScene.starSetup();
initialScene.cameraGlobeSetup()

window.addEventListener("load", spaceText);
window.addEventListener("resize", () => {
    spaceText();
    if (isInitialized) {
        initialScene.cameraGlobeSetup();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

window.addEventListener("onGlobeLoad", () => {
    console.log("loaded");
    hideElements("loadProgressText", true);
    unhideElements("loadEnterText", true);
    window.addEventListener("wheel", enterScene);
    window.addEventListener("touchmove", enterScene); 
});

camera.position.set(0, 0, -2000);

function animate() {
    requestAnimationFrame(animate);

    if (isInitialized) {
        initialScene.globe.scene.rotation.y += 0.001;
    }

    Tween.update();
    renderer.render(scene, camera);
}

animate();