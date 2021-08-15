import './style.css'
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MathUtils, RedFormat } from 'three';


const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector("#threeCanvas"),
    alpha: true,
});
const gltfLoader = new GLTFLoader();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = Three.PCFSoftShadowMap;

const naturalLight = new Three.HemisphereLight(0x858585, 1, 1.3);
naturalLight.scale.set(10, 10, 10);
naturalLight.position.set(-10, 5, 30);

const sunLight = new Three.DirectionalLight(0x858585, 1.4);
sunLight.shadow.bias = -0.0005
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;

const shadowSide = 20;
sunLight.shadow.camera.top = shadowSide;
sunLight.shadow.camera.bottom = -shadowSide;
sunLight.shadow.camera.left = -shadowSide;
sunLight.shadow.camera.right = shadowSide;

sunLight.scale.set(10, 10, 10);
sunLight.position.set(200, 0, 53);

scene.add(naturalLight, sunLight);

const controls = new OrbitControls(camera, renderer.domElement);

const sphereGeometry = new Three.SphereGeometry(5, 30, 30, 0);

let globe = sphereGeometry;
let isLogged = false;
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
    scene.add(globe.scene);
});

Array(200).fill().forEach(element => {
    const geometry = new Three.SphereGeometry(1, 10, 10);
    const material = new Three.MeshStandardMaterial();
    const star = new Three.Mesh(geometry, material);
    const [x,y,z] = new Array(3).fill().map(() => Three.MathUtils.randFloatSpread(1000));
    star.position.set(x, y, z);
    scene.add(star);
    console.log(x, y, z)
});

// window.addEventListener("resize", () => {

// });

function animate() {
    requestAnimationFrame(animate);

    try {
        globe.scene.rotation.y += 0.001;
        const box = new Three.Box3().setFromObject(globe.scene);
        const boxWidth = Math.log1p(window.innerWidth) ** 2 / 2;
        camera.position.set(boxWidth, 4, 50);
        camera.lookAt(0, camera.position.y / 2 -0.5, boxWidth)

        console.log(boxWidth);
        
    } catch {
        if (!isLogged) {
            console.error("loading globe...");
            isLogged = true;
        }
    }

    renderer.render(scene, camera);
}

animate();