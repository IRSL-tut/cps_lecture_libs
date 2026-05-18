const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const carSize = {
  width: 1.2,
  height: 0.2,
  depth: 1.8,
};
const carMoveImpulse = 0.2;
const carTurnSpeed = 1.4;
const carMaxSpeed = 6;
const bounceRestitution = 0.9;
const surfaceFriction = 0.2;
const goalRadius = 1.2;
const goalHeight = 0.02;
const mazeCellSize = 5.6;
const mazeTargetCellPixels = 173;
const mazeMinCellsX = 4;
const mazeMinCellsZ = 4;
const mazeMaxCellsX = 12;
const mazeMaxCellsZ = 12;
const mazeWallThickness = 0.35;
const mazeWallHeight = 2.0;
const groundMargin = 6;

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

function computeMazeDimensions() {
  const viewportWidth = Math.max(canvas.clientWidth, window.innerWidth, 1);
  const viewportHeight = Math.max(canvas.clientHeight, window.innerHeight, 1);

  const cellsX = Math.max(
    mazeMinCellsX,
    Math.min(mazeMaxCellsX, Math.floor(viewportWidth / mazeTargetCellPixels)),
  );
  const cellsZ = Math.max(
    mazeMinCellsZ,
    Math.min(mazeMaxCellsZ, Math.floor(viewportHeight / mazeTargetCellPixels)),
  );

  return {
    cellsX,
    cellsZ,
    cellSize: mazeCellSize,
  };
}

function createGrid(width, height, initialValue) {
  return Array.from({ length: width }, () => Array(height).fill(initialValue));
}

function generateMazeLayout(width, height) {
  const visited = createGrid(width, height, false);
  const verticalWalls = createGrid(width - 1, height, true);
  const horizontalWalls = createGrid(width, height - 1, true);
  const stack = [{ x: 0, z: 0 }];

  visited[0][0] = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = [];

    if (current.x > 0 && !visited[current.x - 1][current.z]) {
      neighbors.push({ x: current.x - 1, z: current.z, direction: "west" });
    }
    if (current.x < width - 1 && !visited[current.x + 1][current.z]) {
      neighbors.push({ x: current.x + 1, z: current.z, direction: "east" });
    }
    if (current.z > 0 && !visited[current.x][current.z - 1]) {
      neighbors.push({ x: current.x, z: current.z - 1, direction: "north" });
    }
    if (current.z < height - 1 && !visited[current.x][current.z + 1]) {
      neighbors.push({ x: current.x, z: current.z + 1, direction: "south" });
    }

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const next = neighbors[Math.floor(Math.random() * neighbors.length)];

    if (next.direction === "east") {
      verticalWalls[current.x][current.z] = false;
    } else if (next.direction === "west") {
      verticalWalls[next.x][next.z] = false;
    } else if (next.direction === "south") {
      horizontalWalls[current.x][current.z] = false;
    } else {
      horizontalWalls[next.x][next.z] = false;
    }

    visited[next.x][next.z] = true;
    stack.push(next);
  }

  return { verticalWalls, horizontalWalls };
}

function cellCenter(mazeOriginX, mazeOriginZ, cellX, cellZ, cellSize) {
  return new BABYLON.Vector3(
    mazeOriginX + (cellX + 0.5) * cellSize,
    carSize.height / 2,
    mazeOriginZ + (cellZ + 0.5) * cellSize,
  );
}

function createWall(scene, wallMaterial, name, width, depth, positionX, positionZ) {
  const wall = BABYLON.MeshBuilder.CreateBox(name, {
    width,
    height: mazeWallHeight,
    depth,
  }, scene);
  wall.position.set(positionX, mazeWallHeight / 2, positionZ);
  wall.material = wallMaterial;

  const aggregate = new BABYLON.PhysicsAggregate(wall, BABYLON.PhysicsShapeType.BOX, {
    mass: 0,
    restitution: bounceRestitution,
    friction: surfaceFriction,
  }, scene);

  aggregate.body.disablePreStep = false;
  return wall;
}

function buildMaze(scene, wallMaterial, mazeConfig) {
  const { cellsX, cellsZ, cellSize } = mazeConfig;
  const { verticalWalls, horizontalWalls } = generateMazeLayout(cellsX, cellsZ);
  const mazeWidth = cellsX * cellSize;
  const mazeDepth = cellsZ * cellSize;
  const mazeOriginX = -mazeWidth / 2;
  const mazeOriginZ = -mazeDepth / 2;
  const walls = [];

  walls.push(createWall(scene, wallMaterial, "wall-north", mazeWidth + mazeWallThickness, mazeWallThickness, 0, mazeOriginZ));
  walls.push(createWall(scene, wallMaterial, "wall-south", mazeWidth + mazeWallThickness, mazeWallThickness, 0, mazeOriginZ + mazeDepth));
  walls.push(createWall(scene, wallMaterial, "wall-west", mazeWallThickness, mazeDepth + mazeWallThickness, mazeOriginX, 0));
  walls.push(createWall(scene, wallMaterial, "wall-east", mazeWallThickness, mazeDepth + mazeWallThickness, mazeOriginX + mazeWidth, 0));

  for (let x = 0; x < cellsX - 1; x++) {
    for (let z = 0; z < cellsZ; z++) {
      if (!verticalWalls[x][z]) {
        continue;
      }

      walls.push(createWall(
        scene,
        wallMaterial,
        `vwall-${x}-${z}`,
        mazeWallThickness,
        cellSize + mazeWallThickness,
        mazeOriginX + (x + 1) * cellSize,
        mazeOriginZ + (z + 0.5) * cellSize,
      ));
    }
  }

  for (let x = 0; x < cellsX; x++) {
    for (let z = 0; z < cellsZ - 1; z++) {
      if (!horizontalWalls[x][z]) {
        continue;
      }

      walls.push(createWall(
        scene,
        wallMaterial,
        `hwall-${x}-${z}`,
        cellSize + mazeWallThickness,
        mazeWallThickness,
        mazeOriginX + (x + 0.5) * cellSize,
        mazeOriginZ + (z + 1) * cellSize,
      ));
    }
  }

  return {
    walls,
    cellsX,
    cellsZ,
    cellSize,
    mazeWidth,
    mazeDepth,
    mazeOriginX,
    mazeOriginZ,
    startPosition: cellCenter(mazeOriginX, mazeOriginZ, cellsX - 1, 0, cellSize),
    goalPosition: new BABYLON.Vector3(
      mazeOriginX + 0.5 * cellSize,
      goalHeight / 2,
      mazeOriginZ + (cellsZ - 0.5) * cellSize,
    ),
  };
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

  const mazeConfig = computeMazeDimensions();

  const groundMat = new BABYLON.StandardMaterial("gMat", scene);
  groundMat.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const carMat = new BABYLON.StandardMaterial("carMat", scene);
  carMat.ambientColor = new BABYLON.Color3(0, 0.5, 1);

  const obsMat = new BABYLON.StandardMaterial("oMat", scene);
  obsMat.ambientColor = new BABYLON.Color3(0.8, 0.2, 0.2);

  const goalMat = new BABYLON.StandardMaterial("goalMat", scene);
  goalMat.ambientColor = new BABYLON.Color3(1, 0.9, 0.1);
  goalMat.emissiveColor = new BABYLON.Color3(0.8, 0.7, 0.1);

  const maze = buildMaze(scene, obsMat, mazeConfig);

  const updateOrtho = () => {
    const aspect = engine.getAspectRatio(camera);
    const halfGroundHeight = (maze.mazeDepth + groundMargin) / 2 + maze.cellSize;
    const halfGroundWidth = (maze.mazeWidth + groundMargin) / 2 + maze.cellSize;
    const zoom = Math.max(halfGroundHeight, halfGroundWidth / aspect);

    camera.orthoTop = zoom;
    camera.orthoBottom = -zoom;
    camera.orthoLeft = -zoom * aspect;
    camera.orthoRight = zoom * aspect;
  };

  window.addEventListener("resize", updateOrtho);
  updateOrtho();

  const ground = BABYLON.MeshBuilder.CreateGround("ground", {
    width: maze.mazeWidth + groundMargin,
    height: maze.mazeDepth + groundMargin,
  }, scene);
  ground.material = groundMat;

  const car = BABYLON.MeshBuilder.CreateBox("car", { width: carSize.width, height: carSize.height, depth: carSize.depth }, scene);
  car.position.copyFrom(maze.startPosition);
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

  const goal = BABYLON.MeshBuilder.CreateCylinder("goal", {
    diameter: goalRadius * 2,
    height: goalHeight,
    tessellation: 24,
  }, scene);
  goal.position.copyFrom(maze.goalPosition);
  goal.material = goalMat;
  goal.isPickable = false;
  console.log("goal position:", { x: maze.goalPosition.x, y: maze.goalPosition.y, z: maze.goalPosition.z });

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

    const rayLength = 100;
    const nextLines = [];
    const nextColors = [];
    const dists = [];

    for (let i = 0; i < 8; i++) {
      const localRayDirection = new BABYLON.Vector3(Math.sin(i * (Math.PI / 4)), 0, Math.cos(i * (Math.PI / 4)));
      const direction = car.getDirection(localRayDirection);

      const rayOrigin = car.position.clone();
      const lineOrigin = car.position.clone();
      rayOrigin.y = 1.0;
      lineOrigin.y = 2.1;

      const ray = new BABYLON.Ray(rayOrigin, direction, rayLength);
      const hit = scene.pickWithRay(ray, (mesh) => mesh !== rayLinesMesh);

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
  });

  return scene;
};

async function initializeScene() {
  const scene = await createScene();

  engine.runRenderLoop(() => scene.render());
}

initializeScene().catch((error) => {
  console.error("Failed to initialize maze scene", error);
});

window.addEventListener("resize", () => engine.resize());