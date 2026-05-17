// TODO 車の形、色
// TODO 障害物の形、色
// TODO 車と障害物の衝突検知
// TODO 衝突を検知したら移動を前に戻す
// TODO subscribe
// TODO publish = state(???)
// mazeをこちらと同じにしてみる

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const obstacleCount = 12;
const obstacleSize = 2;
const carSize = {
  width: 1.2,
  depth: 1.8,
};
const spawnRange = 15;

function isObstacleSpawnSafe(x, z) {
  const minX = carSize.width / 2 + obstacleSize / 2;
  const minZ = carSize.depth / 2 + obstacleSize / 2;

  return Math.abs(x) > minX || Math.abs(z) > minZ;
}

function createSafeObstaclePosition() {
  for (let attempt = 0; attempt < 100; attempt++) {
    const x = Math.random() * spawnRange * 2 - spawnRange;
    const z = Math.random() * spawnRange * 2 - spawnRange;

    if (isObstacleSpawnSafe(x, z)) {
      return new BABYLON.Vector3(x, obstacleSize / 2, z);
    }
  }

  return new BABYLON.Vector3(spawnRange, obstacleSize / 2, spawnRange);
}

function isCarColliding(car, obstacles) {
  car.computeWorldMatrix(true);

  return obstacles.some((obstacle) => {
    obstacle.computeWorldMatrix(true);
    return car.intersectsMesh(obstacle, false);
  });
}

const createScene = function () {
  const scene = new BABYLON.Scene(engine);

  scene.ambientColor = new BABYLON.Color3(1, 1, 1);
  scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1);

  const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 50, 0), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  const updateOrtho = () => {
    const aspect = engine.getAspectRatio(camera);
    const zoom = 15;

    camera.orthoTop = zoom;
    camera.orthoBottom = -zoom;
    camera.orthoLeft = -zoom * aspect;
    camera.orthoRight = zoom * aspect;
  };

  window.addEventListener("resize", updateOrtho);
  updateOrtho();

  const groundMat = new BABYLON.StandardMaterial("gMat", scene);
  groundMat.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const carMat = new BABYLON.StandardMaterial("carMat", scene);
  carMat.ambientColor = new BABYLON.Color3(0, 0.5, 1);

  const obsMat = new BABYLON.StandardMaterial("oMat", scene);
  obsMat.ambientColor = new BABYLON.Color3(0.8, 0.2, 0.2);

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  ground.material = groundMat;

  const car = BABYLON.MeshBuilder.CreateBox("car", { width: carSize.width, height: 0.2, depth: carSize.depth }, scene);
  car.position.y = 0.1;
  car.material = carMat;

  const obstacles = [];

  for (let i = 0; i < obstacleCount; i++) {
    const box = BABYLON.MeshBuilder.CreateBox("obs", { size: obstacleSize }, scene);
    box.position.copyFrom(createSafeObstaclePosition());
    box.material = obsMat;
    obstacles.push(box);
  }

  const rayPoints = [];
  const rayColors = [];

  for (let i = 0; i < 8; i++) {
    rayPoints.push([new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 1, 0)]);
    rayColors.push([new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]);
  }

  let rayLinesMesh = BABYLON.MeshBuilder.CreateLineSystem("rays", {
    lines: rayPoints,
    colors: rayColors,
    updatable: true,
  }, scene);

  // get keys
  const keys = {};
  window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
  });

  scene.registerBeforeRender(() => {
    // move car
    const vy = (keys.w ? 0.15 : 0) - (keys.s ? 0.15 : 0);
    const vx = (keys.d ? 0.1 : 0) -  (keys.a ? 0.1 : 0);
    const vr = (keys.e ? 0.05 : 0) - (keys.q ? 0.05 : 0);

    car.rotation.y += vr;
    if (isCarColliding(car, obstacles)) {
      car.rotation.y -= vr;
    }

    car.translate(BABYLON.Axis.X, vx, BABYLON.Space.LOCAL);
    if (isCarColliding(car, obstacles)) {
      car.translate(BABYLON.Axis.X, -vx, BABYLON.Space.LOCAL);
    }

    car.translate(BABYLON.Axis.Z, vy, BABYLON.Space.LOCAL);
    if (isCarColliding(car, obstacles)) {
      car.translate(BABYLON.Axis.Z, -vy, BABYLON.Space.LOCAL);
    }

    // render distances
    const rayLength = 100;
    const nextLines = [];
    const nextColors = [];
    const dists = [];

    for (let i = 0; i < 8; i++) {
      const angle = i * (Math.PI / 4) + car.rotation.y;
      const direction = new BABYLON.Vector3(Math.sin(angle), 0, Math.cos(angle));

      const rayOrigin = car.position.clone();
      const lineOrigin = car.position.clone();
      rayOrigin.y = 1.0;
      lineOrigin.y = 2.1;

      const ray = new BABYLON.Ray(rayOrigin, direction, rayLength);
      const hit = scene.pickWithRay(ray, (mesh) => mesh.name !== rayLinesMesh);

      let distance = rayLength;
      let color = new BABYLON.Color4(0, 1, 0, 1);

      if (hit.hit) {
        distance = hit.distance;
        color = new BABYLON.Color4(1, 0, 0, 1);
      }

      dists.push(distance.toFixed(1));
      nextLines.push([lineOrigin, lineOrigin.add(direction.scale(distance))]);
      nextColors.push([color, color]);
    }

    rayLinesMesh = BABYLON.MeshBuilder.CreateLineSystem(null, {
      lines: nextLines,
      colors: nextColors,
      instance: rayLinesMesh,
    });

    document.getElementById("dist").innerText = `Distances: ${dists.join(" | ")}`;
    // publish distances

    // publish state {is_goal, goal_direction}
    // publish privileged-state {car_position [], goal_position []}
  });

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
