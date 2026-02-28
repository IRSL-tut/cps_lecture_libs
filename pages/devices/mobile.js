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

let geoWatchId = null;

const startOrientation = () => {
  window.addEventListener("deviceorientation", (event) => {
    setText("oriAlpha", fmt(event.alpha, "deg"));
    setText("oriBeta", fmt(event.beta, "deg"));
    setText("oriGamma", fmt(event.gamma, "deg"));
    setText("oriAbsolute", event.absolute ? "true" : "false");
  });
};

const startMotion = () => {
  window.addEventListener("devicemotion", (event) => {
    const a = event.acceleration || {};
    const ag = event.accelerationIncludingGravity || {};
    const r = event.rotationRate || {};

    setText("accX", fmt(a.x, "m/s^2"));
    setText("accY", fmt(a.y, "m/s^2"));
    setText("accZ", fmt(a.z, "m/s^2"));
    setText("accGX", fmt(ag.x, "m/s^2"));
    setText("accGY", fmt(ag.y, "m/s^2"));
    setText("accGZ", fmt(ag.z, "m/s^2"));
    setText("rotA", fmt(r.alpha, "deg/s"));
    setText("rotB", fmt(r.beta, "deg/s"));
    setText("rotG", fmt(r.gamma, "deg/s"));
    setText("interval", fmt(event.interval, "ms"));
  });
};

const startGeolocation = () => {
  if (!navigator.geolocation) {
    setText("lat", "Unsupported");
    return;
  }

  geoWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const c = pos.coords;
      setText("lat", fmt(c.latitude, "deg"));
      setText("lon", fmt(c.longitude, "deg"));
      setText("acc", fmt(c.accuracy, "m"));
      setText("alt", fmt(c.altitude, "m"));
      setText("heading", fmt(c.heading, "deg"));
      setText("speed", fmt(c.speed, "m/s"));
    },
    (err) => {
      statusEl.textContent = `Geolocation error: ${err.message}`;
    },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
  );
};

const requestMotionPermission = async () => {
  if (typeof DeviceMotionEvent === "undefined" || !DeviceMotionEvent.requestPermission) {
    startMotion();
    return true;
  }

  const response = await DeviceMotionEvent.requestPermission();
  if (response !== "granted") return false;
  startMotion();
  return true;
};

const requestOrientationPermission = async () => {
  if (typeof DeviceOrientationEvent === "undefined" || !DeviceOrientationEvent.requestPermission) {
    startOrientation();
    return true;
  }

  const response = await DeviceOrientationEvent.requestPermission();
  if (response !== "granted") return false;
  startOrientation();
  return true;
};

const startAll = async () => {
  startBtn.disabled = true;
  statusEl.textContent = "Requesting permissions...";

  try {
    const orientationOk = await requestOrientationPermission();
    const motionOk = await requestMotionPermission();
    startGeolocation();

    if (orientationOk || motionOk) {
      statusEl.textContent = "Sensors active";
    } else {
      statusEl.textContent = "Permission denied";
    }
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
  }
};

startBtn.addEventListener("click", startAll);

window.addEventListener("pagehide", () => {
  if (geoWatchId !== null) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
  }
});
