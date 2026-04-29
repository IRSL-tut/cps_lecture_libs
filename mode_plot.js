(function registerPlotMode(myGlobal) {
  if (!myGlobal) {
    return;
  }

  myGlobal.plotState = myGlobal.plotState || {
    chart: null,
    config: null,
    nextColorIndex: 0,
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
      '  <p class="plot-mode__hint">Use progFuncs.point(x, y) to add a point and progFuncs.line(x1, y1, x2, y2) to draw a line segment.</p>',
      '</section>',
    ].join('');
  };

  myGlobal.getPlotCanvas = function getPlotCanvas() {
    return document.getElementById('plot-chart');
  };

  myGlobal.getDefaultPlotConfig = function getDefaultPlotConfig() {
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
            beginAtZero: true,
            type: 'linear',
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

  myGlobal.makeLineDataset = function makeLineDataset(label = 'Line') {
    const color = myGlobal.getNextPlotColor();
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
    myGlobal.plotState.config = myGlobal.clonePlotConfig(config);
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