(function attachEnvCommon(global) {
  const config = Object.freeze({
    carSize: {
      width: 1.2,
      height: 0.2,
      depth: 1.8,
    },
    carMoveImpulse: 0.2,
    carTurnSpeed: 1.4,
    carMaxSpeed: 6,
    bounceRestitution: 0.9,
    surfaceFriction: 0.2,
    goalRadius: 1.2,
    goalHeight: 0.02,
  });

  function mergeConfig(overrides = {}) {
    return {
      ...config,
      ...overrides,
      carSize: {
        ...config.carSize,
        ...(overrides.carSize ?? {}),
      },
    };
  }

  function clampHorizontalVelocity(body, maxSpeed = config.carMaxSpeed) {
    const velocity = body.getLinearVelocity();

    if (!velocity) {
      return;
    }

    velocity.y = 0;

    const horizontalSpeed = Math.hypot(velocity.x, velocity.z);
    if (horizontalSpeed > maxSpeed) {
      const scale = maxSpeed / horizontalSpeed;
      velocity.x *= scale;
      velocity.z *= scale;
    }

    body.setLinearVelocity(velocity);
  }

  function createMaterials(scene) {
    const groundMat = new BABYLON.StandardMaterial("gMat", scene);
    groundMat.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    const carMat = new BABYLON.StandardMaterial("carMat", scene);
    carMat.ambientColor = new BABYLON.Color3(0, 0.5, 1);

    const obsMat = new BABYLON.StandardMaterial("oMat", scene);
    obsMat.ambientColor = new BABYLON.Color3(0.8, 0.2, 0.2);

    const goalMat = new BABYLON.StandardMaterial("goalMat", scene);
    goalMat.ambientColor = new BABYLON.Color3(1, 0.9, 0.1);
    goalMat.emissiveColor = new BABYLON.Color3(0.8, 0.7, 0.1);

    return { groundMat, carMat, obsMat, goalMat };
  }

  function createStaticBox(scene, material, name, sizeOptions, position, activeConfig = config) {
    const box = BABYLON.MeshBuilder.CreateBox(name, sizeOptions, scene);
    box.position.copyFrom(position);
    box.material = material;

    const aggregate = new BABYLON.PhysicsAggregate(box, BABYLON.PhysicsShapeType.BOX, {
      mass: 0,
      restitution: activeConfig.bounceRestitution,
      friction: activeConfig.surfaceFriction,
    }, scene);

    aggregate.body.disablePreStep = false;
    return box;
  }

  function createCar(scene, material, startPosition, activeConfig) {
    const car = BABYLON.MeshBuilder.CreateBox("car", {
      width: activeConfig.carSize.width,
      height: activeConfig.carSize.height,
      depth: activeConfig.carSize.depth,
    }, scene);
    car.position.copyFrom(startPosition);
    car.material = material;
    car.rotationQuaternion = BABYLON.Quaternion.Identity();

    const frontMarkerMaterial = new BABYLON.StandardMaterial("carFrontMat", scene);
    frontMarkerMaterial.ambientColor = new BABYLON.Color3(1, 0.95, 0.2);
    frontMarkerMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.7, 0.1);

    const frontMarker = BABYLON.MeshBuilder.CreateBox("car-front-marker", {
      width: activeConfig.carSize.width * 0.72,
      height: activeConfig.carSize.height * 0.35,
      depth: activeConfig.carSize.depth * 0.14,
    }, scene);
    frontMarker.parent = car;
    frontMarker.position = new BABYLON.Vector3(
      0,
      activeConfig.carSize.height * 0.35,
      activeConfig.carSize.depth * 0.34,
    );
    frontMarker.material = frontMarkerMaterial;
    frontMarker.isPickable = false;

    const aggregate = new BABYLON.PhysicsAggregate(car, BABYLON.PhysicsShapeType.BOX, {
      mass: 1,
      restitution: activeConfig.bounceRestitution,
      friction: activeConfig.surfaceFriction,
    }, scene);

    aggregate.body.setGravityFactor(0);
    aggregate.body.setLinearDamping(2.5);
    aggregate.body.setAngularDamping(8);
    aggregate.body.disablePreStep = false;

    return car;
  }

  function createGoal(scene, material, goalPosition, activeConfig) {
    const goal = BABYLON.MeshBuilder.CreateCylinder("goal", {
      diameter: activeConfig.goalRadius * 2,
      height: activeConfig.goalHeight,
      tessellation: 24,
    }, scene);
    goal.position.copyFrom(goalPosition);
    goal.material = material;
    goal.isPickable = false;
    return goal;
  }

  function createRaySystem(scene) {
    const rayPoints = [];
    const rayColors = [];

    for (let i = 0; i < 8; i++) {
      rayPoints.push([new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 1, 0)]);
      rayColors.push([new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]);
    }

    return BABYLON.MeshBuilder.CreateLineSystem("rays", {
      lines: rayPoints,
      colors: rayColors,
      updatable: true,
    }, scene);
  }

  function installKeyTracker() {
    const keys = {};

    window.addEventListener("keydown", (event) => {
      keys[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (event) => {
      keys[event.key.toLowerCase()] = false;
    });

    return keys;
  }

  function normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  function getHeadingAngle(car) {
    const forwardDirection = car.getDirection(BABYLON.Axis.Z);
    return Math.atan2(forwardDirection.z, forwardDirection.x);
  }

  function getGlobalMessageState() {
    if (typeof myGlobal !== "undefined") {
      return myGlobal;
    }

    return global.myGlobal ?? null;
  }

  function getMessagePool() {
    const messageState = getGlobalMessageState();
    if (!messageState || !messageState.BM) {
      return null;
    }

    return messageState.BM.msg_pool ?? null;
  }

  function createMessagingBridge() {
    const commandState = {
      vx: 0,
      vy: 0,
      vtheta: 0,
    };
    let isSubscribed = false;

    const coerceNumber = (value) => {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : 0;
    };

    return {
      commandState,
      ensureSubscribed() {
        if (isSubscribed) {
          return;
        }

        const msgPool = getMessagePool();
        if (!msgPool) {
          return;
        }

        msgPool.subscribe("command", (msg) => {
          console.log('sub: command: ' + msg);
          if (!Array.isArray(msg) || msg.length < 3) {
            return;
          }

          commandState.vx = coerceNumber(msg[0]);
          commandState.vy = coerceNumber(msg[1]);
          commandState.vtheta = coerceNumber(msg[2]);
        });

        isSubscribed = true;
      },
      publish(topicName, payload) {
        const msgPool = getMessagePool();
        if (!msgPool) {
          return;
        }

        msgPool.publish(topicName, payload);
      },
    };
  }

  function createPublishedState(car, goal, distances, activeConfig) {
    const headingAngle = getHeadingAngle(car);
    const goalOffset = goal.position.subtract(car.position);
    goalOffset.y = 0;

    const goalDistance = goalOffset.length();
    const goalAngle = Math.atan2(goalOffset.z, goalOffset.x);

    return {
      car: {
        sensor: distances,
      },
      state: {
        is_goal: goalDistance <= activeConfig.goalRadius,
        "goal-direction": normalizeAngle(goalAngle - headingAngle),
      },
      privilegedState: {
        car: {
          position: [car.position.x, car.position.z, headingAngle],
        },
        goal: {
          //position: [goal.position.x, goal.position.y, goal.position.z],
          position: [goal.position.x, goal.position.z],
        },
      },
    };
  }

  function applyCarControls(car, keys, activeConfig, commandState = { vx: 0, vy: 0, vtheta: 0 }) {
    const moveForward  = (keys.w ? 1 : 0) - (keys.s ? 1 : 0) + commandState.vx;
    const moveSideways = (keys.d ? 1 : 0) - (keys.a ? 1 : 0) - commandState.vy;
    const turnInput    = (keys.q ? 1 : 0) - (keys.e ? 1 : 0) + commandState.vtheta;

    const rightDirection = car.getDirection(BABYLON.Axis.X);
    const forwardDirection = car.getDirection(BABYLON.Axis.Z);
    const impulseDirection = rightDirection.scale(moveSideways).add(forwardDirection.scale(moveForward));

    if (impulseDirection.lengthSquared() > 0) {
      impulseDirection.y = 0;
      impulseDirection.normalize().scaleInPlace(activeConfig.carMoveImpulse);
      car.physicsBody.applyImpulse(impulseDirection, car.position);
    }

    car.physicsBody.setAngularVelocity(new BABYLON.Vector3(0, -turnInput * activeConfig.carTurnSpeed, 0));
    clampHorizontalVelocity(car.physicsBody, activeConfig.carMaxSpeed);
  }

  function updateRaySystem(scene, car, rayLinesMesh) {
    const rayLength = 1000;
    const nextLines = [];
    const nextColors = [];
    const rawDistances = [];

    for (let i = 0; i < 8; i++) {
      const localRayAngle = -i * (Math.PI / 4);
      const localRayDirection = new BABYLON.Vector3(Math.sin(localRayAngle), 0, Math.cos(localRayAngle));
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

      rawDistances.push(distance);
      nextLines.push([lineOrigin, lineOrigin.add(direction.scale(distance))]);
      nextColors.push([color, color]);
    }

    return {
      rayLinesMesh: BABYLON.MeshBuilder.CreateLineSystem(null, {
        lines: nextLines,
        colors: nextColors,
        instance: rayLinesMesh,
      }),
      distances: rawDistances.map((distance) => distance.toFixed(1)),
      rawDistances,
    };
  }

  async function createEnvironmentScene(options) {
    const activeConfig = mergeConfig(options.config);
    const scene = new BABYLON.Scene(options.engine);
    const havokInstance = await HavokPhysics();
    const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);

    scene.enablePhysics(BABYLON.Vector3.Zero(), physicsPlugin);

    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1);

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 50, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

    const materials = createMaterials(scene);
    const environment = options.createEnvironment({
      scene,
      camera,
      engine: options.engine,
      materials,
      config: activeConfig,
    });

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {
      width: environment.groundWidth,
      height: environment.groundHeight,
    }, scene);
    ground.material = materials.groundMat;

    if (typeof options.configureCamera === "function") {
      const updateOrtho = () => {
        options.configureCamera({
          camera,
          engine: options.engine,
          scene,
          environment,
          config: activeConfig,
        });
      };

      window.addEventListener("resize", updateOrtho);
      updateOrtho();
    }

    const car = createCar(scene, materials.carMat, environment.startPosition, activeConfig);
    const goal = createGoal(scene, materials.goalMat, environment.goalPosition, activeConfig);
    const distElement = document.getElementById(options.distElementId ?? "dist");
    const keys = installKeyTracker();
    const messagingBridge = createMessagingBridge();
    let rayLinesMesh = createRaySystem(scene);

    console.log("goal position:", {
      x: environment.goalPosition.x,
      y: environment.goalPosition.y,
      z: environment.goalPosition.z,
    });

    if (typeof options.afterSetup === "function") {
      options.afterSetup({
        scene,
        camera,
        ground,
        car,
        goal,
        materials,
        environment,
        config: activeConfig,
      });
    }

    scene.registerBeforeRender(() => {
      messagingBridge.ensureSubscribed();
      applyCarControls(car, keys, activeConfig, messagingBridge.commandState);

      const sensorState = updateRaySystem(scene, car, rayLinesMesh);
      rayLinesMesh = sensorState.rayLinesMesh;
      const publishedState = createPublishedState(car, goal, sensorState.rawDistances, activeConfig);

      if (distElement) {
        distElement.innerText = `Distances: ${sensorState.distances.join(" | ")}`;
      }

      messagingBridge.publish("car", publishedState.car);
      messagingBridge.publish("state", publishedState.state);
      messagingBridge.publish("privilledged-state", publishedState.privilegedState);

      if (typeof options.beforeRender === "function") {
        options.beforeRender({
          scene,
          camera,
          car,
          goal,
          environment,
          distances: sensorState.rawDistances,
          rayLinesMesh,
          config: activeConfig,
        });
      }
    });

    return scene;
  }

  async function initializeEnvironment(options) {
    const scene = await createEnvironmentScene(options);

    options.engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => options.engine.resize());

    return scene;
  }

  global.EnvCommon = {
    config,
    clampHorizontalVelocity,
    createStaticBox,
    initializeEnvironment,
  };
}(window));
