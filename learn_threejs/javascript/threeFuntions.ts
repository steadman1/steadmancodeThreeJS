import * as Three from "three";
import * as Tween from "@tweenjs/tween.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class InitializeScene {
    gltfLoader: GLTFLoader;
    globe: any;
    scene: Three.Scene;
    camera: Three.PerspectiveCamera;

    constructor(scene, camera) {
        this.globe = new Three.SphereGeometry(5, 30, 30, 0);
        this.gltfLoader = new GLTFLoader();
        this.scene = scene;
        this.camera = camera;
    }

    initializedCameraPosition() {
        const boxWidth = Math.log1p(window.innerWidth) ** 2 / 2;
        return new Three.Vector3(-boxWidth + 9.3, 0.7, 152);
    }

    loadGlobe(event) {
        this.gltfLoader.load("assets/globe/globeGLTF.gltf", (obj) => {
            obj.scene.traverse(function (object) {
                // const objHelper = new Three.BoxHelper(object);
                // scene.add(objHelper);
                if (object.isMesh) {
                    // object.material.flatShading = Three.SmoothShading;
                    object.castShadow = true;
                    object.receiveShadow = true;
                }   
            });
            this.globe = obj;
            this.globe.scene.position.set(0,0,100)
            this.globe.scene.rotation.set(0, 0.5, 0)
            this.globe.scene.scale.set(1.2, 1.2, 1.2);
            this.scene.add(this.globe.scene)
            window.dispatchEvent(event);
            //unhideElements();
        }, async (progress) => {
            const progressTotal = Math.round(progress.loaded / progress.total);
            const progressText = document.getElementById("loadProgressText");
            progressText.innerText = progressTotal * 100 + " %";
        });
    }
    
    cameraGlobeSetup() {
        const cameraPosition = this.initializedCameraPosition();
        this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    lightingSetup() {
        const naturalLight = new Three.HemisphereLight(0x858585, 1, 1.3);
        naturalLight.scale.set(10, 10, 10);
        naturalLight.position.set(-10, 5, 250);

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
        sunLight.position.set(200, 0, 380);
        this.scene.add(naturalLight, sunLight);
    }

    starSetup() {
        Array(3200).fill().forEach(element => {
            const geometry = new Three.SphereGeometry(1, 10, 10);
            const material = new Three.MeshStandardMaterial();
            const star = new Three.Mesh(geometry, material);
            const [x,y] = new Array(3).fill().map(() => Three.MathUtils.randFloatSpread(2000));
            const z = Three.MathUtils.randFloatSpread(8000);
            star.position.set(x, y, -Math.abs(z) - 800);
            this.scene.add(star);
        });
    }

    zoomToGlobe() {
        const cameraPosition = this.initializedCameraPosition();
        const tween = new Tween.Tween({
            x: this.camera.position.x, 
            y: this.camera.position.y, 
            z: this.camera.position.z})
                .to({x: 0, y: 18, z: 150}, 4000)
                .easing(Tween.Easing.Cubic.InOut)

        const tween1 = new Tween.Tween({x: 0, y: 18, z: 150})
        .to({
            x: cameraPosition.x,
            y: cameraPosition.y, 
            z: cameraPosition.z}, 4000)
                .easing(Tween.Easing.Cubic.InOut)
        
        tween.chain(tween1);

        tween.onUpdate((object: {x:number, y:number, z:number}) => {
            this.camera.position.set(object.x, object.y, object.z)
        });
        tween1.onUpdate((object: {x:number, y:number, z:number}) => {
            this.camera.position.set(object.x, object.y, object.z)
        });
        tween.start()
    }
}

export { InitializeScene }