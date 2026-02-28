const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");

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
  });
  sensor.addEventListener("error", (event) => {
    statusEl.textContent = `Gyroscope error: ${event.error?.message || "unknown"}`;
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

const startAll = () => {
  if (!window.isSecureContext) {
    statusEl.textContent = "Sensor APIs require HTTPS";
    return;
  }

  startBtn.disabled = true;
  statusEl.textContent = "Starting sensors...";

  try {
    startAccelerometer();
    startLinearAcceleration();
    startGyroscope();
    startAbsoluteOrientation();
    startRelativeOrientation();

    statusEl.textContent = "Sensors active";
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    startBtn.disabled = false;
  }
};

startBtn.addEventListener("click", startAll);

window.addEventListener("pagehide", () => {
  stopAll();
});
