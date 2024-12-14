import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'; 
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.126.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.126.1/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.126.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { VRButton } from 'https://unpkg.com/three@0.128.0/examples/jsm/webxr/VRButton.js';

//init
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setPixelRatio( window.devicePixelRatio * 1);
renderer.setSize(w,h);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

//Camera
const fov = 70;
const aspect = w / h;
const near = 0.1;
const far = 20;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 3;
const scene = new THREE.Scene();

//const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;
//controls.dampingFactor = 0.1;

//objects
const geo = new THREE.IcosahedronGeometry(1.3, 50);
const mat = new THREE.MeshStandardMaterial({color: 0xffffff, wireframe: false,flatShading: false});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
//mesh.position.x = -1.5;
const meshVertices = mesh.geometry.attributes.position.array.slice();

const pointsMaterial2 = new THREE.PointsMaterial({
  color: 0x0000ff,
  size: 0.005,
  transparent: true,
  opacity: 1,
});

const points2 = new THREE.Points(geo, pointsMaterial2);
//mesh.add(points2);


const geo2 = new THREE.IcosahedronGeometry(1.5, 50);
const mat2 = new THREE.MeshStandardMaterial({color: 0xffffff, wireframe: true, flatShading: false});
const mesh2 = new THREE.Mesh(geo2, mat2);
const meshVertices2 = mesh2.geometry.attributes.position.array.slice();
mesh2.position.x = 0;
//scene.add(mesh2);


let check = false;

//lights
//const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa0099, 0.6);
//const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xff0022, 0.6);
//const hemiLight = new THREE.HemisphereLight(0xff6600, 0x6600ff, 0.6);
//const hemiLight = new THREE.HemisphereLight(0xee0011, 0x4433cc, 0.6);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);

function animateHemiLight(t) {
  const topHue = ( t * 0.1 );
  const bottomHue = ( t * 0.8);
  hemiLight.color.setHSL( topHue, 1, 0.6 );
  hemiLight.groundColor.setHSL( bottomHue, 1, 0.6 );
}

const spotLight1 = new THREE.SpotLight(0xff0022);
spotLight1.position.set(1, 1, 1);
spotLight1.castShadow = true;
spotLight1.shadow.mapSize.width = 1024;
spotLight1.shadow.mapSize.height = 1024;
spotLight1.shadow.camera.near = 0.5;
spotLight1.shadow.camera.far = 500;
spotLight1.shadow.camera.fov = 30;

const spotLight2 = new THREE.SpotLight(0x0099ff);
spotLight2.position.set(-1, -1, -1);
spotLight2.castShadow = true;
spotLight2.shadow.mapSize.width = 1024;
spotLight2.shadow.mapSize.height = 1024;
spotLight2.shadow.camera.near = 0.5;
spotLight2.shadow.camera.far = 500;
spotLight2.shadow.camera.fov = 30;

scene.add(hemiLight);
//scene.add(spotLight1);
//scene.add(spotLight2);

document.addEventListener('wheel', function(event) {
    // You can also access the event.deltaY property to determine the direction of the scroll
    if (event.deltaY > 0) {
      check = true;
    } else {
        check = false;
    }
  });

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.1, 0.05);
composer.addPass(bloomPass);

scene.fog = new THREE.FogExp2(0x000000, 0.3);



document.addEventListener('mousemove', function(event) {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    const x = event.clientX / windowHalfX * 2 - 1;
    const y = -(event.clientY / windowHalfY) * 2 + 1;
    camera.position.x += (x - camera.position.x) * 0.05;
    camera.position.y += (y - camera.position.y) * 0.05;
  });

  //Animate
function animate(t = 0){
    requestAnimationFrame(animate);
    camera.lookAt(scene.position);
    animateHemiLight(t*0.0001);
    if (check) {
        const positionAttribute = mesh.geometry.attributes.position;
        const normalizedT = Math.sin(t * 0.0001);
        for (let i = 0; i < positionAttribute.count; i++) {
          const rand = (Math.random() - 0.5) * 0.02;
          const x = positionAttribute.getX(i);
          const y = positionAttribute.getY(i);
          const z = positionAttribute.getZ(i);
          
          const offset = Math.sin(t * 0.0004 + (x * x + y * y) * 3) * 0.003;
          positionAttribute.setX(i, x + offset * normalizedT * Math.sin(x * y * z * 2) * 0.06);
          positionAttribute.setY(i, y + offset );
          positionAttribute.setZ(i, z + offset );     
        }
        
        const positionAttributes = mesh2.geometry.attributes.position;
        for (let i = 0; i < positionAttributes.count; i++) {
            const x = positionAttributes.getX(i);
            const y = positionAttributes.getY(i);
            const z = positionAttributes.getZ(i);
            const offset = Math.sin(t * 0.0006 + (x * x + y * y) * 1) * 0.01;
            positionAttributes.setX(i, x + normalizedT * Math.sin(x * y * z * 10) * 0.01);
            positionAttributes.setY(i, y + normalizedT * offset * Math.cos(x * y * z * 10) * 0.01);
            positionAttributes.setZ(i, z + normalizedT* Math.cos(z * x * z * 30) * 0.01);     
        }
        mesh.geometry.attributes.position.needsUpdate = true;
        mesh2.geometry.attributes.position.needsUpdate = true;
    }else{
        morphMeshToVertices(mesh, meshVertices)
        morphMeshToVertices(mesh2, meshVertices2)
    }


    mesh.rotation.y = t/3500;
    mesh.rotation.x = t/8000;
    mesh.rotation.z = t/8000;
    mesh.position.y = Math.cos(t*0.0015) / 25;
    mesh2.rotation.y = t/3500;
    mesh2.rotation.x = t/3500;
    mesh2.position.y = Math.cos(t*0.0015) / 25;
    composer.render();

    //controls.update();

}
animate();

function morphMeshToVertices(mesh, vertices) {
    const position = mesh.geometry.attributes.position;
    const positionArray = position.array;
    for (let i = 0; i < position.count; i++) {
      const x = positionArray[i * 3];
      const y = positionArray[i * 3 + 1];
      const z = positionArray[i * 3 + 2];
      const dx = vertices[i * 3] - x;
      const dy = vertices[i * 3 + 1] - y;
      const dz = vertices[i * 3 + 2] - z;
      position.setXYZ(
        i,
        x + 0.09 * dx,
        y + 0.015 * dy,
        z + 0.05 * dz
      );
    }
    position.needsUpdate = true;
  }
