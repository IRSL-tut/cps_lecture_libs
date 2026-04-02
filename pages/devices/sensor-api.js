const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");
const sensorPickerEl = document.getElementById("sensorPicker");
const cancelSelectBtn = document.getElementById("cancelSelectBtn");
const confirmSelectBtn = document.getElementById("confirmSelectBtn");

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
};

const fmt = (value, unit = "") => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const num = typeof value === "number" ? value.toFixed(3) : value;
  return unit ? `${num} ${unit}` : `${num}`;
};

const fmtQuat = (quat) => {
  if (!quat || typeof quat[0] !== "number") return "-";
  return `[${quat.map((v) => v.toFixed(3)).join(", ")}]`;
};

const sensors = [];

const stopAll = () => {
  while (sensors.length) {
    const s = sensors.pop();
    try { s.stop(); } catch { /* ignore */ }
  }
};

const startAccelerometer = () => {
  if (typeof Accelerometer === "undefined") {
    setText("accX", "Unsupported");
    return;
  }
  const sensor = new Accelerometer({ frequency: 60 });
  sensor.addEventListener("reading", () => {
    setText("accX", fmt(sensor.x, "m/s^2"));
    setText("accY", fmt(sensor.y, "m/s^2"));
    setText("accZ", fmt(sensor.z, "m/s^2"));
    setText("accT", fmt(sensor.timestamp, "ms"));
    //
    myGlobal.BM.msg_pool.publish('accel', [sensor.x, sensor.y, sensor.z, sensor.timestamp]);
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Accelerometer error: ${event.error?.message || "unknown"}`;
  });
  sensor.start();
  sensors.push(sensor);
};

const startLinearAcceleration = () => {
  if (typeof LinearAccelerationSensor === "undefined") {
    setText("linX", "Unsupported");
    return;
  }
  const sensor = new LinearAccelerationSensor({ frequency: 60 });
  sensor.addEventListener("reading", () => {
    setText("linX", fmt(sensor.x, "m/s^2"));
    setText("linY", fmt(sensor.y, "m/s^2"));
    setText("linZ", fmt(sensor.z, "m/s^2"));
    setText("linT", fmt(sensor.timestamp, "ms"));
    //
    myGlobal.BM.msg_pool.publish('lin_acc', [sensor.x, sensor.y, sensor.z, sensor.timestamp]);
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Linear accel error: ${event.error?.message || "unknown"}`;
  });
  sensor.start();
  sensors.push(sensor);
};

const startGyroscope = () => {
  if (typeof Gyroscope === "undefined") {
    setText("gyroX", "Unsupported");
    return;
  }
  const sensor = new Gyroscope({ frequency: 60 });
  sensor.addEventListener("reading", () => {
    setText("gyroX", fmt(sensor.x, "rad/s"));
    setText("gyroY", fmt(sensor.y, "rad/s"));
    setText("gyroZ", fmt(sensor.z, "rad/s"));
    setText("gyroT", fmt(sensor.timestamp, "ms"));
    //
    myGlobal.BM.msg_pool.publish('gyro', [sensor.x, sensor.y, sensor.z, sensor.timestamp]);
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Gyroscope error: ${event.error?.message || "unknown"}`;
  });
  sensor.start();
  sensors.push(sensor);
};

const startAmbientLight = () => {
  if (typeof AmbientLightSensor === "undefined") {
    setText("alsLux", "Unsupported");
    return;
  }
  const sensor = new AmbientLightSensor({ frequency: 10 });
  sensor.addEventListener("reading", () => {
    setText("alsLux", fmt(sensor.illuminance, "lux"));
    setText("alsT", fmt(sensor.timestamp, "ms"));
    myGlobal.BM.msg_pool.publish('ambient', [sensor.illuminance, sensor.timestamp]);
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Ambient light error: ${event.error?.message || "unknown"}`;
  });
  sensor.start();
  sensors.push(sensor);
};

const startGravity = () => {
  if (typeof GravitySensor === "undefined") {
    setText("gravX", "Unsupported");
    return;
  }
  const sensor = new GravitySensor({ frequency: 60 });
  sensor.addEventListener("reading", () => {
    setText("gravX", fmt(sensor.x, "m/s^2"));
    setText("gravY", fmt(sensor.y, "m/s^2"));
    setText("gravZ", fmt(sensor.z, "m/s^2"));
    setText("gravT", fmt(sensor.timestamp, "ms"));
    myGlobal.BM.msg_pool.publish('gravity', [sensor.x, sensor.y, sensor.z, sensor.timestamp]);
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Gravity error: ${event.error?.message || "unknown"}`;
  });
  sensor.start();
  sensors.push(sensor);
};

const startMagnetometer = () => {
  if (typeof Magnetometer === "undefined") {
    setText("magX", "Unsupported");
    return;
  }
  const sensor = new Magnetometer({ frequency: 60 });
  sensor.addEventListener("reading", () => {
    setText("magX", fmt(sensor.x, "uT"));
    setText("magY", fmt(sensor.y, "uT"));
    setText("magZ", fmt(sensor.z, "uT"));
    setText("magT", fmt(sensor.timestamp, "ms"));
    myGlobal.BM.msg_pool.publish('magnet', [sensor.x, sensor.y, sensor.z, sensor.timestamp]);
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Magnetometer error: ${event.error?.message || "unknown"}`;
  });
  sensor.start();
  sensors.push(sensor);
};

const startAbsoluteOrientation = () => {
  if (typeof AbsoluteOrientationSensor === "undefined") {
    setText("absQuat", "Unsupported");
    return;
  }
  const sensor = new AbsoluteOrientationSensor({ frequency: 60 });
  sensor.addEventListener("reading", () => {
    setText("absQuat", fmtQuat(sensor.quaternion));
    setText("absT", fmt(sensor.timestamp, "ms"));
    //
    myGlobal.BM.msg_pool.publish('abs_quat', [sensor.quaternion[0], sensor.quaternion[1], sensor.quaternion[2], sensor.quaternion[3], sensor.timestamp]);
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Abs orientation error: ${event.error?.message || "unknown"}`;
  });
  sensor.start();
  sensors.push(sensor);
};

const startRelativeOrientation = () => {
  if (typeof RelativeOrientationSensor === "undefined") {
    setText("relQuat", "Unsupported");
    return;
  }
  const sensor = new RelativeOrientationSensor({ frequency: 60 });
  sensor.addEventListener("reading", () => {
    setText("relQuat", fmtQuat(sensor.quaternion));
    setText("relT", fmt(sensor.timestamp, "ms"));
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Rel orientation error: ${event.error?.message || "unknown"}`;
  });
  sensor.start();
  sensors.push(sensor);
};

const sensorStarters = {
  accelerometer: startAccelerometer,
  linearAcceleration: startLinearAcceleration,
  gyroscope: startGyroscope,
  ambientLight: startAmbientLight,
  gravity: startGravity,
  magnetometer: startMagnetometer,
  absoluteOrientation: startAbsoluteOrientation,
  relativeOrientation: startRelativeOrientation,
};

const openSensorPicker = () => {
  sensorPickerEl.classList.add("open");
  statusEl.textContent = "Select sensors to start";
};

const closeSensorPicker = () => {
  sensorPickerEl.classList.remove("open");
};

const getSelectedSensors = () => {
  const selected = [];
  const checkboxes = sensorPickerEl.querySelectorAll('input[name="sensor"]:checked');
  checkboxes.forEach((checkbox) => {
    selected.push(checkbox.value);
  });
  return selected;
};

const startSelected = (selectedSensors) => {
  myGlobal.BM.msg_pool.publish('log', 'start-button');
  if (!window.isSecureContext) {
    statusEl.textContent = "Sensor APIs require HTTPS";
    return;
  }

  if (!selectedSensors.length) {
    statusEl.textContent = "Select at least one sensor";
    return;
  }

  startBtn.disabled = true;
  statusEl.textContent = "Starting sensors...";

  try {
    selectedSensors.forEach((sensorName) => {
      const startSensor = sensorStarters[sensorName];
      if (startSensor) {
        startSensor();
      }
    });

    statusEl.textContent = "Sensors active";
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    startBtn.disabled = false;
  }
};

startBtn.addEventListener("click", () => {
  if (!window.isSecureContext) {
    statusEl.textContent = "Sensor APIs require HTTPS";
    return;
  }
  openSensorPicker();
});

cancelSelectBtn.addEventListener("click", () => {
  closeSensorPicker();
  statusEl.textContent = "Start canceled";
});

confirmSelectBtn.addEventListener("click", () => {
  const selectedSensors = getSelectedSensors();
  if (!selectedSensors.length) {
    statusEl.textContent = "Select at least one sensor";
    return;
  }
  closeSensorPicker();
  startSelected(selectedSensors);
});

window.addEventListener("pagehide", () => {
  stopAll();
});
