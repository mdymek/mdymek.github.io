//Małgorzata Dymek
//Przemysław Stachura

var pointColor = 0xe1cdf4; //kolor zwykłego
var stationColor = 0xfffb3d; //kolor stacji

//klasa zawierająca obiekt i informację o tym, czy jest stacją
class pointObject {
    constructor(object, bool) {
        this.object = object;
        this.ifStation = bool;
    }
}


document.addEventListener('mousedown', onDocumentMouseDown, false);

var scene = new THREE.Scene();

var cameraHolder = new THREE.Object3D();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(camera);
cameraHolder.add(camera);
camera.position.z = 6;
camera.position.y = 2;
scene.add(cameraHolder);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor("#000000");
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x7c7882);

//światło
var ambientLight = new THREE.AmbientLight(0x404440);
scene.add(ambientLight);
var light = new THREE.DirectionalLight(0xd0bded, 1, 1);
light.position.set(1, 1, 1);
scene.add(light);

var lineGeometry = new THREE.Geometry();
var checkPoints = [];
//utworzenie sześciu zwykłych punktów, dodanie do listy
//tworzenie/usuwanie stacji przy kliknięciu (zamiana punktu na stację)
for (i = 0; i < 6; i++) {
    var geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    var material = new THREE.MeshPhysicalMaterial();
    material.color = new THREE.Color(pointColor);
    material.overdraw = 0.5;
    material.needsUpdate = true;
    geometry.colorsNeedsUpdate = true;

    object = new pointObject(new THREE.Mesh(geometry, material), false);
    checkPoints[i] = object;
    scene.add(checkPoints[i].object);
    var randomPosition = new THREE.Vector3(Math.random() * 5 - 2, Math.random() * 5 - 2, Math.random() * 5 - 2);
    lineGeometry.vertices.push(randomPosition);

    checkPoints[i].object.position.set(randomPosition.x, randomPosition.y, randomPosition.z);
}
//właściwości linii
lineGeometry.vertices.push(randomPosition);
lineGeometry.vertices.push(checkPoints[0].object.position);
var line = new THREE.Line(lineGeometry, material);
scene.add(line);

var geometry = new THREE.SphereGeometry(0.3, 0.3, 0.3);
var material = new THREE.MeshPhysicalMaterial({ color: "#857532" });
//utworzenie pojazdu
var vehicle = new THREE.Mesh(geometry, material);
scene.add(vehicle);
vehicle.position.set(checkPoints[0].object.position.x, checkPoints[0].object.position.y, checkPoints[0].object.position.z);
console.log(checkPoints[0].object.position.x, checkPoints[0].object.position.y, checkPoints[0].object.position.z);
var fuel = 1;


clock = new THREE.Clock();
var currentPointIndexFrom = 0;
var currentPointIndexDest = 1;

var time = 0;

var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    time += clock.getDelta();

    //obliczanie kolejnej pozycji
    var positionFrom = new THREE.Vector3(checkPoints[currentPointIndexFrom].object.position.x, checkPoints[currentPointIndexFrom].object.position.y, checkPoints[currentPointIndexFrom].object.position.z);
    var positionDest = new THREE.Vector3(checkPoints[currentPointIndexDest].object.position.x, checkPoints[currentPointIndexDest].object.position.y, checkPoints[currentPointIndexDest].object.position.z);
    var pos = new THREE.Vector3(positionFrom.x + (positionDest.x - positionFrom.x) * time, positionFrom.y + (positionDest.y - positionFrom.y) * time, positionFrom.z + (positionDest.z - positionFrom.z) * time);

    //zatrzymanie, jeśli zabrakło paliwa
    if (fuel > 0) {
        vehicle.position.set(pos.x, pos.y, pos.z);
    }

    //sprawdzenie, czy został osiągnięty punkt; przej
    var distance = vehicle.position.distanceTo(checkPoints[currentPointIndexDest].object.position);
    if (distance <= 0.07) {
        if (checkPoints[currentPointIndexDest].ifStation) {
            fuel = 1;
        }
        currentPointIndexFrom++;
        if (currentPointIndexFrom >= checkPoints.length) {
            currentPointIndexFrom = 0;
        }
        currentPointIndexDest++;
        if (currentPointIndexDest >= checkPoints.length) {
            currentPointIndexDest = 0;
        }

        time = 0;
    }

    fuel -= clock.getDelta() * 200; //spalone paliwo
    vehicle.material.color.setRGB(1 - fuel, fuel, 0); //zmiana koloru w zależności od ilości paliwa
}

//zmiana punktu na stację/stacji na punkt w wyniku kliknięcia
function onDocumentMouseDown(e) {
    e.preventDefault();

    keyName = e.key;
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    mouse.x = (window.event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (window.event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        //znalezienie obiektu, który został kliknięty
        for (i = 0; i < checkPoints.length; i++) {
            if (checkPoints[i].object == intersects[0].object) {
                //zamiana
                if (checkPoints[i].ifStation) {
                    checkPoints[i].ifStation = false;
                    checkPoints[i].object.material.color.setHex(pointColor);
                }
                else {
                    checkPoints[i].ifStation = true;
                    checkPoints[i].object.material.color.setHex(stationColor);
                }
                
            }
        }

    }
}

//obracanie kamery
document.addEventListener('keydown', (event) => {
	keyName = event.key;
	if(keyName == "ArrowRight"){
		cameraHolder.rotateY(Math.PI / 100);
		console.log(cameraHolder.rotation);
	}
	else if(keyName == "ArrowLeft"){
		cameraHolder.rotateY(-Math.PI / 100);
		console.log(cameraHolder.rotation);
	}
	if(keyName == "ArrowUp"){
		cameraHolder.rotateX(-Math.PI / 100);
		console.log(cameraHolder.rotation);
	}
	else if(keyName == "ArrowDown"){
		cameraHolder.rotateX(Math.PI / 100);
		console.log(cameraHolder.rotation);
	}
});


render();