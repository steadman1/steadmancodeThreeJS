import './style.css'
import * as Three from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { spaceText } from './javascript/textSpacing';
import { lightingSetup, starSetup, cameraGlobeSetup } from './javascript/threeFuntions';
import { unhideElements, hideElements,  } from './javascript/initializeHTML';


const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector("#threeCanvas"),
    alpha: true,
});

function enterScene() {
    hideElements({id: "loadEnterText"});
    unhideElements({id: "nameContainer"});
}

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = Three.PCFSoftShadowMap;

const event = new CustomEvent("onGlobeLoad", {});

let globe = new Three.SphereGeometry(5, 30, 30, 0);
let isLogged = false;
const gltfLoader =  new GLTFLoader();
gltfLoader.load("assets/globe/globeGLTF.gltf", (obj) => {
    obj.scene.traverse(function (object) {
        // const objHelper = new Three.BoxHelper(object);
        // scene.add(objHelper);
        if (object.isMesh) {
            // object.material.flatShading = Three.SmoothShading;
            object.castShadow = true;
            object.receiveShadow = true;
        }   
    });
    globe = obj;
    globe.scene.rotation.set(0, 0.5, 0)
    globe.scene.scale.set(1.2, 1.2, 1.2);
    //scene.add(globe.scene);
    window.dispatchEvent(event);
    //unhideElements();
}, async (progress) => {
    const progressTotal = Math.round(progress.loaded / progress.total);
    const progressText = document.getElementById("loadProgressText");
    progressText.innerText = progressTotal * 100 + " %";
});


lightingSetup(scene);
starSetup(scene);
cameraGlobeSetup(camera)

window.addEventListener("load", spaceText);
window.addEventListener("resize", spaceText);
window.addEventListener("resize", () => {
    cameraGlobeSetup(camera);
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(camera.aspect)
});
window.addEventListener("onGlobeLoad", () => {
    console.log("loaded");
    hideElements({id: "loadProgressText"});
    unhideElements({id: "loadEnterText"});
});

function animate() {
    requestAnimationFrame(animate);

    try {
        globe.scene.rotation.y += 0.001;

        window.onscroll(() => console.log("scroll"))

    } catch {
        if (!isLogged) {
            console.error("loading globe...");
            isLogged = true;
        }
    }

    renderer.render(scene, camera);
}

animate();