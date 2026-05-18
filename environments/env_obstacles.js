// TODO 車の形、色
// TODO 障害物の形、色
// TODO subscribe
// TODO publish = state(???)
// DONE mazeをこちらと同じにしてみる
// DONE 車と障害物の衝突検知
// DONE 衝突を検知したら移動を前に戻す

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const { config: envConfig, createStaticBox, initializeEnvironment } = window.EnvCommon;
const obstacleCount = 12;
const obstacleSize = 2;
const spawnRange = 15;

function isObstacleSpawnSafe(x, z) {
  const minX = envConfig.carSize.width / 2 + obstacleSize / 2;
  const minZ = envConfig.carSize.depth / 2 + obstacleSize / 2;

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

  const minGoalDistance = obstacleSize / 2 + envConfig.goalRadius;

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
      return new BABYLON.Vector3(x, envConfig.goalHeight / 2, z);
    }
  }

  return new BABYLON.Vector3(
    spawnRange - envConfig.goalRadius,
    envConfig.goalHeight / 2,
    spawnRange - envConfig.goalRadius,
  );
}

function buildObstacles(scene, obstacleMaterial) {
  const obstaclePositions = [];

  for (let i = 0; i < obstacleCount; i++) {
    const obstaclePosition = createSafeObstaclePosition();
    createStaticBox(
      scene,
      obstacleMaterial,
      `obs-${i}`,
      { size: obstacleSize },
      obstaclePosition,
      envConfig,
    );
    obstaclePositions.push(obstaclePosition.clone());
  }

  return obstaclePositions;
}

function createRandomObstacleEnvironment({ scene, materials }) {
  const obstaclePositions = buildObstacles(scene, materials.obsMat);

  return {
    groundWidth: 100,
    groundHeight: 100,
    startPosition: new BABYLON.Vector3(0, envConfig.carSize.height / 2, 0),
    goalPosition: createSafeGoalPosition(obstaclePositions),
  };
}

function configureObstacleCamera({ camera, engine: sceneEngine }) {
  const aspect = sceneEngine.getAspectRatio(camera);
  const zoom = 15;

  camera.orthoTop = zoom;
  camera.orthoBottom = -zoom;
  camera.orthoLeft = -zoom * aspect;
  camera.orthoRight = zoom * aspect;
}

initializeEnvironment({
  engine,
  createEnvironment: createRandomObstacleEnvironment,
  configureCamera: configureObstacleCamera,
}).catch((error) => {
  console.error("Failed to initialize random obstacles scene", error);
});
