import * as Three from "three";

function cameraGlobeSetup(camera) {
    const boxWidth = Math.log1p(window.innerWidth) ** 2 / 2;
    camera.position.set(boxWidth, 4, 50);
    camera.lookAt(0, camera.position.y / 2 -0.5, boxWidth);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function lightingSetup(scene) {
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
}

function starSetup(scene) {
    Array(300).fill().forEach(element => {
        const geometry = new Three.SphereGeometry(1, 10, 10);
        const material = new Three.MeshStandardMaterial();
        const star = new Three.Mesh(geometry, material);
        const [x,y] = new Array(3).fill().map(() => Three.MathUtils.randFloatSpread(2000));
        const z = Three.MathUtils.randFloatSpread(300);
        star.position.set(-Math.abs(x), y, -Math.abs(z) - 300);
        scene.add(star);
    });
}

export { lightingSetup, starSetup, cameraGlobeSetup }