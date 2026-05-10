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
    ticks: {
      xStep: 1,
      yStep: 1,
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
      '  <p class="plot-mode__hint">Use progFuncs.point(x, y, datasetIndex), progFuncs.line(x1, y1, x2, y2, datasetIndex), progFuncs.directed_line(x, y, theta, size, length, color, datasetIndex), and progFuncs.set_plot_range(xMin, xMax, yMin, yMax).</p>',
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

  myGlobal.getCurrentPlotTicks = function getCurrentPlotTicks() {
    const ticks = myGlobal.plotState.ticks || {};
    return {
      xStep: Number.isFinite(Number(ticks.xStep)) && Number(ticks.xStep) > 0 ? Number(ticks.xStep) : 1,
      yStep: Number.isFinite(Number(ticks.yStep)) && Number(ticks.yStep) > 0 ? Number(ticks.yStep) : 1,
    };
  };

  myGlobal.getDefaultPlotConfig = function getDefaultPlotConfig() {
    const range = myGlobal.getCurrentPlotRange();
    const ticks = myGlobal.getCurrentPlotTicks();
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
              stepSize: ticks.xStep,
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
              stepSize: ticks.yStep,
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
    const ticks = myGlobal.getCurrentPlotTicks();

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
    if (!nextConfig.options.scales.x.ticks) {
      nextConfig.options.scales.x.ticks = {};
    }
    nextConfig.options.scales.x.ticks.stepSize = ticks.xStep;
    nextConfig.options.scales.y.type = 'linear';
    nextConfig.options.scales.y.min = range.yMin;
    nextConfig.options.scales.y.max = range.yMax;
    if (!nextConfig.options.scales.y.ticks) {
      nextConfig.options.scales.y.ticks = {};
    }
    nextConfig.options.scales.y.ticks.stepSize = ticks.yStep;

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

  myGlobal.makePlotGapPoint = function makePlotGapPoint() {
    return {x: null, y: null};
  };

  myGlobal.toPlotNumber = function toPlotNumber(value, name) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new Error(`${name} must be a finite number`);
    }

    return numericValue;
  };

  myGlobal.toDatasetIndex = function toDatasetIndex(value, fallback = 0) {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }

    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || numericValue < 0) {
      throw new Error('datasetIndex must be a non-negative integer');
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

  myGlobal.point = function point(x, y, datasetIndex = 0) {
    const baseConfig = myGlobal.clonePlotConfig(myGlobal.ensurePlotConfig());
    const targetDatasetIndex = myGlobal.toDatasetIndex(datasetIndex, 0);
    if (!baseConfig.data.datasets[targetDatasetIndex]) {
      baseConfig.data.datasets[targetDatasetIndex] = myGlobal.makePointDataset(`Points ${targetDatasetIndex + 1}`);
    }
    if (!Array.isArray(baseConfig.data.datasets[targetDatasetIndex].data)) {
      baseConfig.data.datasets[targetDatasetIndex].data = [];
    }

    baseConfig.data.datasets[targetDatasetIndex].data.push({
      x: Number(x),
      y: Number(y),
    });
    myGlobal.setPlotConfig(baseConfig);
  };

  myGlobal.line = function line(x1, y1, x2, y2, datasetIndexOrLabel) {
    const baseConfig = myGlobal.clonePlotConfig(myGlobal.ensurePlotConfig());

    if (typeof datasetIndexOrLabel === 'string') {
      const nextDataset = myGlobal.makeLineDataset(datasetIndexOrLabel || `Line ${baseConfig.data.datasets.length + 1}`);
      nextDataset.data = [
        { x: Number(x1), y: Number(y1) },
        { x: Number(x2), y: Number(y2) },
      ];
      baseConfig.data.datasets.push(nextDataset);
      myGlobal.setPlotConfig(baseConfig);
      return;
    }

    const targetDatasetIndex = myGlobal.toDatasetIndex(datasetIndexOrLabel, 0);
    if (!baseConfig.data.datasets[targetDatasetIndex]) {
      baseConfig.data.datasets[targetDatasetIndex] = myGlobal.makeLineDataset(`Line ${targetDatasetIndex + 1}`);
    }
    if (!Array.isArray(baseConfig.data.datasets[targetDatasetIndex].data)) {
      baseConfig.data.datasets[targetDatasetIndex].data = [];
    }

    if (baseConfig.data.datasets[targetDatasetIndex].data.length > 0) {
      baseConfig.data.datasets[targetDatasetIndex].data.push(myGlobal.makePlotGapPoint());
    }

    baseConfig.data.datasets[targetDatasetIndex].data.push(
      { x: Number(x1), y: Number(y1) },
      { x: Number(x2), y: Number(y2) },
    );
    myGlobal.setPlotConfig(baseConfig);
  };

  myGlobal.directedLine = function directedLine(x, y, theta, size, length, color, datasetIndex) {
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
    let targetDataset;

    if (datasetIndex === undefined || datasetIndex === null || datasetIndex === '') {
      targetDataset = myGlobal.makeLineDataset(`Directed Line ${baseConfig.data.datasets.length + 1}`, color);
      targetDataset.data = [startPoint, endPoint];
      baseConfig.data.datasets.push(targetDataset);
    } else {
      const targetDatasetIndex = myGlobal.toDatasetIndex(datasetIndex, 0);
      if (!baseConfig.data.datasets[targetDatasetIndex]) {
        baseConfig.data.datasets[targetDatasetIndex] = myGlobal.makeLineDataset(`Directed Line ${targetDatasetIndex + 1}`, color);
      }
      targetDataset = baseConfig.data.datasets[targetDatasetIndex];
      if (!Array.isArray(targetDataset.data)) {
        targetDataset.data = [];
      }
      if (targetDataset.data.length > 0) {
        targetDataset.data.push(myGlobal.makePlotGapPoint());
      }
      targetDataset.data.push(startPoint, endPoint);
    }

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

      targetDataset.data.push(
        myGlobal.makePlotGapPoint(),
        endPoint,
        leftWing,
        myGlobal.makePlotGapPoint(),
        endPoint,
        rightWing,
      );
    }

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

  myGlobal.setPlotTicks = function setPlotTicks(xStep, yStep) {
    const nextTicks = {
      xStep: Number(xStep),
      yStep: Number(yStep),
    };

    if (!Number.isFinite(nextTicks.xStep) || !Number.isFinite(nextTicks.yStep)) {
      throw new Error('Plot tick values must be numbers');
    }
    if (nextTicks.xStep <= 0 || nextTicks.yStep <= 0) {
      throw new Error('Plot tick values must be greater than zero');
    }

    myGlobal.plotState.ticks = nextTicks;
    myGlobal.plotState.config = myGlobal.applyPlotRangeToConfig(myGlobal.ensurePlotConfig());

    if (myGlobal.currentView === 'plot') {
      myGlobal.renderPlotChart();
    }
    if (typeof myGlobal.setStatus === 'function') {
      myGlobal.setStatus(`Plot ticks updated: x=${nextTicks.xStep}, y=${nextTicks.yStep}`);
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

    progFuncs.point = (x, y, datasetIndex) => {
      myGlobal.point(x, y, datasetIndex);
    };
    progFuncs.line = (x1, y1, x2, y2, datasetIndexOrLabel) => {
      myGlobal.line(x1, y1, x2, y2, datasetIndexOrLabel);
    };
    progFuncs.directed_line = (x, y, theta, size, length, color, datasetIndex) => {
      myGlobal.directedLine(x, y, theta, size, length, color, datasetIndex);
    };
    progFuncs.set_plot_range = (xMin, xMax, yMin, yMax) => {
      myGlobal.setPlotRange(xMin, xMax, yMin, yMax);
    };
    progFuncs.set_plot_ticks = (xStep, yStep) => {
      myGlobal.setPlotTicks(xStep, yStep);
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