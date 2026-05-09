(function registerPlotMode(myGlobal) {
  if (!myGlobal) {
    return;
  }

  myGlobal.plotState = myGlobal.plotState || {
    chart: null,
    config: null,
    nextColorIndex: 0,
    range: {
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
    },
  };

  myGlobal.getPlotModeRightPane = function getPlotModeRightPane() {
    return [
      '<section class="plot-mode" aria-label="plot chart output">',
      '  <div class="plot-mode__header">',
      '    <div>',
      '      <h3>Chart Output</h3>',
      '      <p>Chart.js canvas for plot mode.</p>',
      '    </div>',
      '    <button class="toolbar__button" id="plot-clear-button" type="button">Clear plot</button>',
      '  </div>',
      '  <div class="plot-mode__canvas-wrap">',
      '    <canvas id="plot-chart" aria-label="plot chart"></canvas>',
      '  </div>',
      '  <p class="plot-mode__hint">Use progFuncs.point(x, y), progFuncs.line(x1, y1, x2, y2), progFuncs.directed_line(x, y, theta, size, length, color), and progFuncs.set_plot_range(xMin, xMax, yMin, yMax).</p>',
      '</section>',
    ].join('');
  };

  myGlobal.getPlotCanvas = function getPlotCanvas() {
    return document.getElementById('plot-chart');
  };

  myGlobal.getCurrentPlotRange = function getCurrentPlotRange() {
    const range = myGlobal.plotState.range || {};
    return {
      xMin: Number.isFinite(Number(range.xMin)) ? Number(range.xMin) : -10,
      xMax: Number.isFinite(Number(range.xMax)) ? Number(range.xMax) : 10,
      yMin: Number.isFinite(Number(range.yMin)) ? Number(range.yMin) : -10,
      yMax: Number.isFinite(Number(range.yMax)) ? Number(range.yMax) : 10,
    };
  };

  myGlobal.getDefaultPlotConfig = function getDefaultPlotConfig() {
    const range = myGlobal.getCurrentPlotRange();
    return {
      type: 'scatter',
      data: {
        datasets: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: range.xMin,
            max: range.xMax,
            title: {
              display: true,
              text: 'x',
              color: '#434343',
            },
            grid: {
              color: '#dddddd',
            },
            ticks: {
              color: '#434343',
            },
          },
          y: {
            type: 'linear',
            min: range.yMin,
            max: range.yMax,
            title: {
              display: true,
              text: 'y',
              color: '#434343',
            },
            grid: {
              color: '#dddddd',
            },
            ticks: {
              color: '#434343',
            },
          },
        },
      },
    };
  };

  myGlobal.clonePlotConfig = function clonePlotConfig(config) {
    return JSON.parse(JSON.stringify(config));
  };

  myGlobal.applyPlotRangeToConfig = function applyPlotRangeToConfig(config) {
    const nextConfig = myGlobal.clonePlotConfig(config);
    const range = myGlobal.getCurrentPlotRange();

    if (!nextConfig.options) {
      nextConfig.options = {};
    }
    if (!nextConfig.options.scales) {
      nextConfig.options.scales = {};
    }
    if (!nextConfig.options.scales.x) {
      nextConfig.options.scales.x = {};
    }
    if (!nextConfig.options.scales.y) {
      nextConfig.options.scales.y = {};
    }

    nextConfig.options.scales.x.type = 'linear';
    nextConfig.options.scales.x.min = range.xMin;
    nextConfig.options.scales.x.max = range.xMax;
    nextConfig.options.scales.y.type = 'linear';
    nextConfig.options.scales.y.min = range.yMin;
    nextConfig.options.scales.y.max = range.yMax;

    return nextConfig;
  };

  myGlobal.getPlotPalette = function getPlotPalette() {
    return ['#3b5b92', '#c8553d', '#2f7d4a', '#7c56a3', '#c08a23', '#16808f'];
  };

  myGlobal.getNextPlotColor = function getNextPlotColor() {
    const palette = myGlobal.getPlotPalette();
    const index = myGlobal.plotState.nextColorIndex % palette.length;
    myGlobal.plotState.nextColorIndex += 1;
    return palette[index];
  };

  myGlobal.makePointDataset = function makePointDataset(label = 'Points') {
    const color = myGlobal.getNextPlotColor();
    return {
      type: 'scatter',
      label,
      data: [],
      showLine: false,
      pointRadius: 4,
      pointHoverRadius: 5,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 1,
    };
  };

  myGlobal.resolvePlotColor = function resolvePlotColor(colorValue) {
    if (typeof colorValue === 'string' && colorValue.trim()) {
      return colorValue.trim();
    }

    return myGlobal.getNextPlotColor();
  };

  myGlobal.makeLineDataset = function makeLineDataset(label = 'Line', colorValue = null) {
    const color = myGlobal.resolvePlotColor(colorValue);
    return {
      type: 'line',
      label,
      data: [],
      showLine: true,
      pointRadius: 0,
      pointHoverRadius: 0,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      fill: false,
      tension: 0,
    };
  };

  myGlobal.toPlotNumber = function toPlotNumber(value, name) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new Error(`${name} must be a finite number`);
    }

    return numericValue;
  };

  myGlobal.toPlotAngleRadians = function toPlotAngleRadians(theta) {
    const numericTheta = myGlobal.toPlotNumber(theta, 'theta');
    if (Math.abs(numericTheta) > (Math.PI * 2) + 1e-9) {
      return numericTheta * Math.PI / 180;
    }

    return numericTheta;
  };

  myGlobal.ensurePlotConfig = function ensurePlotConfig() {
    if (!myGlobal.plotState.config) {
      myGlobal.plotState.config = myGlobal.getDefaultPlotConfig();
    }

    if (!myGlobal.plotState.config.data) {
      myGlobal.plotState.config.data = { datasets: [] };
    }
    if (!Array.isArray(myGlobal.plotState.config.data.datasets)) {
      myGlobal.plotState.config.data.datasets = [];
    }

    return myGlobal.plotState.config;
  };

  myGlobal.destroyPlotChart = function destroyPlotChart() {
    if (myGlobal.plotState.chart) {
      myGlobal.plotState.chart.destroy();
      myGlobal.plotState.chart = null;
    }
  };

  myGlobal.renderPlotChart = function renderPlotChart() {
    const canvas = myGlobal.getPlotCanvas();
    if (!canvas || typeof Chart === 'undefined') {
      return;
    }

    myGlobal.destroyPlotChart();

    const config = myGlobal.plotState.config
      ? myGlobal.clonePlotConfig(myGlobal.plotState.config)
      : myGlobal.getDefaultPlotConfig();

    myGlobal.plotState.chart = new Chart(canvas, config);
  };

  myGlobal.setPlotConfig = function setPlotConfig(config) {
    myGlobal.plotState.config = myGlobal.applyPlotRangeToConfig(config);
    if (myGlobal.currentView === 'plot') {
      myGlobal.renderPlotChart();
    }
    if (typeof myGlobal.setStatus === 'function') {
      myGlobal.setStatus('Plot updated');
    }
  };

  myGlobal.plotChart = function plotChart(type, labels, values, datasetLabel = 'Series 1') {
    const nextLabels = Array.isArray(labels) ? labels : [];
    const nextValues = Array.isArray(values) ? values : [];
    const nextPoints = nextValues.map((value, index) => ({
      x: Number(nextLabels[index] ?? index),
      y: Number(value),
    }));
    const defaultConfig = myGlobal.getDefaultPlotConfig();
    const dataset = type === 'bar'
      ? {
          ...myGlobal.makeLineDataset(datasetLabel || 'Series 1'),
          type: 'bar',
          pointRadius: 0,
        }
      : {
          ...myGlobal.makeLineDataset(datasetLabel || 'Series 1'),
          pointRadius: 3,
          pointHoverRadius: 4,
        };

    myGlobal.setPlotConfig({
      ...defaultConfig,
      type,
      data: {
        datasets: [
          {
            ...dataset,
            data: nextPoints,
          },
        ],
      },
    });
  };

  myGlobal.plotLine = function plotLine(labels, values, datasetLabel = 'Series 1') {
    myGlobal.plotChart('line', labels, values, datasetLabel);
  };

  myGlobal.plotBar = function plotBar(labels, values, datasetLabel = 'Series 1') {
    myGlobal.plotChart('bar', labels, values, datasetLabel);
  };

  myGlobal.plotPoints = function plotPoints(points, datasetLabel = 'Series 1') {
    const nextPoints = Array.isArray(points) ? points : [];
    const defaultConfig = myGlobal.getDefaultPlotConfig();

    myGlobal.setPlotConfig({
      ...defaultConfig,
      type: 'scatter',
      data: {
        datasets: [
          {
            ...myGlobal.makePointDataset(datasetLabel || 'Series 1'),
            label: datasetLabel || 'Series 1',
            data: nextPoints.map((point) => ({
              x: Number(point.x),
              y: Number(point.y),
            })),
            showLine: false,
          },
        ],
      },
    });
  };

  myGlobal.appendPlotPoint = function appendPlotPoint(label, value, datasetIndex = 0) {
    const baseConfig = myGlobal.clonePlotConfig(myGlobal.ensurePlotConfig());
    if (!baseConfig.data.datasets[datasetIndex]) {
      baseConfig.data.datasets[datasetIndex] = myGlobal.makePointDataset(`Points ${datasetIndex + 1}`);
    }
    if (!Array.isArray(baseConfig.data.datasets[datasetIndex].data)) {
      baseConfig.data.datasets[datasetIndex].data = [];
    }
    baseConfig.data.datasets[datasetIndex].data.push({
      x: Number(label),
      y: Number(value),
    });
    myGlobal.setPlotConfig(baseConfig);
  };

  myGlobal.point = function point(x, y, datasetIndex = 0) {
    const baseConfig = myGlobal.clonePlotConfig(myGlobal.ensurePlotConfig());
    if (!baseConfig.data.datasets[datasetIndex]) {
      baseConfig.data.datasets[datasetIndex] = myGlobal.makePointDataset('Points');
    }
    if (!Array.isArray(baseConfig.data.datasets[datasetIndex].data)) {
      baseConfig.data.datasets[datasetIndex].data = [];
    }

    baseConfig.data.datasets[datasetIndex].type = 'scatter';
    baseConfig.data.datasets[datasetIndex].showLine = false;
    baseConfig.data.datasets[datasetIndex].data.push({
      x: Number(x),
      y: Number(y),
    });
    myGlobal.setPlotConfig(baseConfig);
  };

  myGlobal.line = function line(x1, y1, x2, y2, datasetLabel) {
    const baseConfig = myGlobal.clonePlotConfig(myGlobal.ensurePlotConfig());
    const nextDataset = myGlobal.makeLineDataset(datasetLabel || `Line ${baseConfig.data.datasets.length + 1}`);

    nextDataset.data = [
      { x: Number(x1), y: Number(y1) },
      { x: Number(x2), y: Number(y2) },
    ];
    baseConfig.data.datasets.push(nextDataset);
    myGlobal.setPlotConfig(baseConfig);
  };

  myGlobal.directedLine = function directedLine(x, y, theta, size, length, color) {
    const centerX = myGlobal.toPlotNumber(x, 'x');
    const centerY = myGlobal.toPlotNumber(y, 'y');
    const angle = myGlobal.toPlotAngleRadians(theta);
    const lineLength = Math.abs(myGlobal.toPlotNumber(length, 'length'));
    const arrowSize = size === undefined || size === null || size === ''
      ? 0
      : Math.abs(myGlobal.toPlotNumber(size, 'size'));

    const halfLength = lineLength / 2;
    const deltaX = Math.cos(angle) * halfLength;
    const deltaY = Math.sin(angle) * halfLength;
    const startPoint = { x: centerX - deltaX, y: centerY - deltaY };
    const endPoint = { x: centerX + deltaX, y: centerY + deltaY };

    const baseConfig = myGlobal.clonePlotConfig(myGlobal.ensurePlotConfig());
    const nextDataset = myGlobal.makeLineDataset(`Directed Line ${baseConfig.data.datasets.length + 1}`, color);
    nextDataset.data = [startPoint, endPoint];

    if (arrowSize > 0) {
      const arrowSpread = Math.PI / 6;
      const leftWing = {
        x: endPoint.x + Math.cos(angle + Math.PI - arrowSpread) * arrowSize,
        y: endPoint.y + Math.sin(angle + Math.PI - arrowSpread) * arrowSize,
      };
      const rightWing = {
        x: endPoint.x + Math.cos(angle + Math.PI + arrowSpread) * arrowSize,
        y: endPoint.y + Math.sin(angle + Math.PI + arrowSpread) * arrowSize,
      };

      nextDataset.data.push(null, endPoint, leftWing, null, endPoint, rightWing);
    }

    baseConfig.data.datasets.push(nextDataset);
    myGlobal.setPlotConfig(baseConfig);
  };

  myGlobal.setPlotRange = function setPlotRange(xMin, xMax, yMin = xMin, yMax = xMax) {
    const nextRange = {
      xMin: Number(xMin),
      xMax: Number(xMax),
      yMin: Number(yMin),
      yMax: Number(yMax),
    };

    if (!Number.isFinite(nextRange.xMin) || !Number.isFinite(nextRange.xMax)
      || !Number.isFinite(nextRange.yMin) || !Number.isFinite(nextRange.yMax)) {
      throw new Error('Plot range values must be numbers');
    }
    if (nextRange.xMin >= nextRange.xMax || nextRange.yMin >= nextRange.yMax) {
      throw new Error('Plot range min must be smaller than max');
    }

    myGlobal.plotState.range = nextRange;
    myGlobal.plotState.config = myGlobal.applyPlotRangeToConfig(myGlobal.ensurePlotConfig());

    if (myGlobal.currentView === 'plot') {
      myGlobal.renderPlotChart();
    }
    if (typeof myGlobal.setStatus === 'function') {
      myGlobal.setStatus(`Plot range updated: x=[${nextRange.xMin}, ${nextRange.xMax}], y=[${nextRange.yMin}, ${nextRange.yMax}]`);
    }
  };

  myGlobal.clearPlot = function clearPlot() {
    myGlobal.plotState.config = myGlobal.getDefaultPlotConfig();
    myGlobal.plotState.nextColorIndex = 0;
    if (myGlobal.currentView === 'plot') {
      myGlobal.renderPlotChart();
    }
    if (typeof myGlobal.setStatus === 'function') {
      myGlobal.setStatus('Plot cleared');
    }
  };

  myGlobal.registerPlotFuncs = function registerPlotFuncs() {
    if (typeof progFuncs === 'undefined') {
      return;
    }

    progFuncs.plot_chart = (type, labels, values, datasetLabel) => {
      myGlobal.plotChart(type, labels, values, datasetLabel);
    };
    progFuncs.plot_line = (labels, values, datasetLabel) => {
      myGlobal.plotLine(labels, values, datasetLabel);
    };
    progFuncs.plot_bar = (labels, values, datasetLabel) => {
      myGlobal.plotBar(labels, values, datasetLabel);
    };
    progFuncs.plot_points = (points, datasetLabel) => {
      myGlobal.plotPoints(points, datasetLabel);
    };
    progFuncs.append_plot_point = (label, value, datasetIndex) => {
      myGlobal.appendPlotPoint(label, value, datasetIndex);
    };
    progFuncs.point = (x, y, datasetIndex) => {
      myGlobal.point(x, y, datasetIndex);
    };
    progFuncs.line = (x1, y1, x2, y2, datasetLabel) => {
      myGlobal.line(x1, y1, x2, y2, datasetLabel);
    };
    progFuncs.directed_line = (x, y, theta, size, length, color) => {
      myGlobal.directedLine(x, y, theta, size, length, color);
    };
    progFuncs.plot_directed_line = (x, y, theta, size, length, color) => {
      myGlobal.directedLine(x, y, theta, size, length, color);
    };
    progFuncs.set_plot_range = (xMin, xMax, yMin, yMax) => {
      myGlobal.setPlotRange(xMin, xMax, yMin, yMax);
    };
    progFuncs.plot_clear = () => {
      myGlobal.clearPlot();
    };
  };

  myGlobal.setupPlotModePane = function setupPlotModePane() {
    const clearPlotButton = document.getElementById('plot-clear-button');

    myGlobal.registerPlotFuncs();
    if (!myGlobal.plotState.config) {
      myGlobal.plotState.config = myGlobal.getDefaultPlotConfig();
    }
    myGlobal.renderPlotChart();

    if (clearPlotButton) {
      clearPlotButton.addEventListener('click', () => {
        myGlobal.clearPlot();
      });
    }
  };

  myGlobal.registerPlotFuncs();
})(typeof myGlobal === 'undefined' ? null : myGlobal);