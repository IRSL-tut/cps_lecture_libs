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
  height: 0.2,
  depth: 1.8,
};
const spawnRange = 15;
const carMoveImpulse = 0.2;
const carTurnSpeed = 1.4;
const carMaxSpeed = 6;
const bounceRestitution = 0.9;
const surfaceFriction = 0.2;
const goalRadius = 1.2;
const goalHeight = 0.02;

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

function isGoalSpawnSafe(x, z, obstaclePositions) {
  if (!isObstacleSpawnSafe(x, z)) {
    return false;
  }

  const minGoalDistance = obstacleSize / 2 + goalRadius;

  return obstaclePositions.every((position) => {
    const dx = position.x - x;
    const dz = position.z - z;
    return Math.hypot(dx, dz) > minGoalDistance;
  });
}

function createSafeGoalPosition(obstaclePositions) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const x = Math.random() * spawnRange * 2 - spawnRange;
    const z = Math.random() * spawnRange * 2 - spawnRange;

    if (isGoalSpawnSafe(x, z, obstaclePositions)) {
      return new BABYLON.Vector3(x, goalHeight / 2, z);
    }
  }

  return new BABYLON.Vector3(spawnRange - goalRadius, goalHeight / 2, spawnRange - goalRadius);
}

function clampHorizontalVelocity(body) {
  const velocity = body.getLinearVelocity();

  if (!velocity) {
    return;
  }

  velocity.y = 0;

  const horizontalSpeed = Math.hypot(velocity.x, velocity.z);
  if (horizontalSpeed > carMaxSpeed) {
    const scale = carMaxSpeed / horizontalSpeed;
    velocity.x *= scale;
    velocity.z *= scale;
  }

  body.setLinearVelocity(velocity);
}

const createScene = async function () {
  const scene = new BABYLON.Scene(engine);
  const havokInstance = await HavokPhysics();
  const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);

  scene.enablePhysics(BABYLON.Vector3.Zero(), physicsPlugin);

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

  const goalMat = new BABYLON.StandardMaterial("goalMat", scene);
  goalMat.ambientColor = new BABYLON.Color3(1, 0.9, 0.1);
  goalMat.emissiveColor = new BABYLON.Color3(0.8, 0.7, 0.1);

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  ground.material = groundMat;

  const car = BABYLON.MeshBuilder.CreateBox("car", { width: carSize.width, height: carSize.height, depth: carSize.depth }, scene);
  car.position.y = 0.1;
  car.material = carMat;
  car.rotationQuaternion = BABYLON.Quaternion.Identity();

  const carAggregate = new BABYLON.PhysicsAggregate(car, BABYLON.PhysicsShapeType.BOX, {
    mass: 1,
    restitution: bounceRestitution,
    friction: surfaceFriction,
  }, scene);

  car.physicsBody.setGravityFactor(0);
  car.physicsBody.setLinearDamping(2.5);
  car.physicsBody.setAngularDamping(8);
  car.physicsBody.disablePreStep = false;

  const obstaclePositions = [];

  for (let i = 0; i < obstacleCount; i++) {
    const box = BABYLON.MeshBuilder.CreateBox("obs", { size: obstacleSize }, scene);
    const obstaclePosition = createSafeObstaclePosition();
    box.position.copyFrom(obstaclePosition);
    box.material = obsMat;
    obstaclePositions.push(obstaclePosition.clone());

    const obstacleAggregate = new BABYLON.PhysicsAggregate(box, BABYLON.PhysicsShapeType.BOX, {
      mass: 0,
      restitution: bounceRestitution,
      friction: surfaceFriction,
    }, scene);

    obstacleAggregate.body.disablePreStep = false;
  }

  const goalPosition = createSafeGoalPosition(obstaclePositions);
  const goal = BABYLON.MeshBuilder.CreateCylinder("goal", {
    diameter: goalRadius * 2,
    height: goalHeight,
    tessellation: 24,
  }, scene);
  goal.position.copyFrom(goalPosition);
  goal.material = goalMat;
  goal.isPickable = false;
  console.log("goal position:", { x: goalPosition.x, y: goalPosition.y, z: goalPosition.z });

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
    const moveForward = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
    const moveSideways = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
    const turnInput = (keys.e ? 1 : 0) - (keys.q ? 1 : 0);

    const rightDirection = car.getDirection(BABYLON.Axis.X);
    const forwardDirection = car.getDirection(BABYLON.Axis.Z);
    const impulseDirection = rightDirection.scale(moveSideways).add(forwardDirection.scale(moveForward));

    if (impulseDirection.lengthSquared() > 0) {
      impulseDirection.y = 0;
      impulseDirection.normalize().scaleInPlace(carMoveImpulse);
      car.physicsBody.applyImpulse(impulseDirection, car.position);
    }

    car.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, turnInput * carTurnSpeed, 0));
    clampHorizontalVelocity(car.physicsBody);

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

async function initializeScene() {
  const scene = await createScene();

  engine.runRenderLoop(() => scene.render());
}

initializeScene().catch((error) => {
  console.error("Failed to initialize random obstacles scene", error);
});

window.addEventListener("resize", () => engine.resize());
