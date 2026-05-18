const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const { config: envConfig, createStaticBox, initializeEnvironment } = window.EnvCommon;
const mazeCellSize = 5.6;
const mazeTargetCellPixels = 173;
const mazeMinCellsX = 4;
const mazeMinCellsZ = 4;
const mazeMaxCellsX = 12;
const mazeMaxCellsZ = 12;
const mazeWallThickness = 0.35;
const mazeWallHeight = 2.0;
const groundMargin = 6;

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
    envConfig.carSize.height / 2,
    mazeOriginZ + (cellZ + 0.5) * cellSize,
  );
}

function createWall(scene, wallMaterial, name, width, depth, positionX, positionZ) {
  return createStaticBox(
    scene,
    wallMaterial,
    name,
    {
      width,
      height: mazeWallHeight,
      depth,
    },
    new BABYLON.Vector3(positionX, mazeWallHeight / 2, positionZ),
    envConfig,
  );
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
      envConfig.goalHeight / 2,
      mazeOriginZ + (cellsZ - 0.5) * cellSize,
    ),
  };
}

function createMazeEnvironment({ scene, materials }) {
  const mazeConfig = computeMazeDimensions();
  const maze = buildMaze(scene, materials.obsMat, mazeConfig);

  return {
    ...maze,
    groundWidth: maze.mazeWidth + groundMargin,
    groundHeight: maze.mazeDepth + groundMargin,
  };
}

function configureMazeCamera({ camera, engine: sceneEngine, environment }) {
  const aspect = sceneEngine.getAspectRatio(camera);
  const halfGroundHeight = environment.groundHeight / 2 + environment.cellSize;
  const halfGroundWidth = environment.groundWidth / 2 + environment.cellSize;
  const zoom = Math.max(halfGroundHeight, halfGroundWidth / aspect);

  camera.orthoTop = zoom;
  camera.orthoBottom = -zoom;
  camera.orthoLeft = -zoom * aspect;
  camera.orthoRight = zoom * aspect;
}

initializeEnvironment({
  engine,
  createEnvironment: createMazeEnvironment,
  configureCamera: configureMazeCamera,
}).catch((error) => {
  console.error("Failed to initialize maze scene", error);
});
