function initializeUprog(myGlobal) {
  myGlobal.rootStyle = document.documentElement.style;
  myGlobal.leftPane = document.getElementById('leftPane');
  myGlobal.rightPane = document.getElementById('rightPane');
  myGlobal.leftContent = document.getElementById('leftContent');
  myGlobal.rightContent = document.getElementById('rightContent');
  myGlobal.divider = document.getElementById('divider');
  myGlobal.status = document.getElementById('appStatus');
  myGlobal.navButtons = document.querySelectorAll('.toolbar__nav-button');
  myGlobal.runStopButton = document.getElementById('run-stop-button');
  myGlobal.stepSlider = document.getElementById('step_num');
  myGlobal.stepValue = document.getElementById('step_num-value');
  myGlobal.highlightCheck = document.getElementById('highlight-check');
  myGlobal.uploadButton = document.getElementById('upload-button');
  myGlobal.mergeCheck = document.getElementById('merge-check');
  myGlobal.downloadButton = document.getElementById('download-button');
  myGlobal.clearButton = document.getElementById('clear_block-button');
  myGlobal.uploadFileInput = document.getElementById('upload-file-input');
  myGlobal.dragging = false;
  myGlobal.currentView = null;
  myGlobal.blockly_workspace = null;
  myGlobal.currentInterpreter = null;
  myGlobal.executionTimer = null;
  myGlobal.isRunning = false;
  myGlobal.enableHighlight = false;
  myGlobal.stepNum = Number(myGlobal.stepSlider.value) || 1;

  myGlobal.views = {
    program: {
      left: '<h3>Left: Overview</h3><div id="blocklyDiv"></div><p>Welcome to uProg. Use the divider to resize the panels.</p>',
      right: '<h3>Right: Checklist</h3><ul><li>Read the brief</li><li>Open the demo</li><li>Start coding</li></ul>',
    },
    plot: {
      left: '<h3>Left: Overview</h3><div id="blocklyDiv"></div><p>Welcome to uProg. Use the divider to resize the panels.</p>',
      right: '<h3>Right: Output</h3><p>Try editing the code and run the sample.</p>',
    },
    notes: {
      left: '<h3>Left: Notes</h3><p>Keep your notes here for quick reference.</p>',
      right: '<h3>Right: Tasks</h3><ol><li>Test the API</li><li>Record results</li><li>Share feedback</li></ol>',
    },
  };

  myGlobal.blockFuncs = {
    highlightBlock(id) {
      if (!myGlobal.blockly_workspace || !myGlobal.enableHighlight) {
        return;
      }
      myGlobal.blockly_workspace.highlightBlock(id);
    },
  };

  myGlobal.clamp = function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  myGlobal.setStatus = function setStatus(message) {
    if (myGlobal.status) {
      myGlobal.status.textContent = message;
    }
  };

  myGlobal.updateRunButton = function updateRunButton() {
    const icon = myGlobal.runStopButton.querySelector('.toolbar__icon');
    const label = myGlobal.runStopButton.querySelector('.toolbar__button-text');

    if (myGlobal.isRunning) {
      myGlobal.runStopButton.dataset.running = 'true';
      myGlobal.runStopButton.title = 'Stop blocks';
      myGlobal.runStopButton.setAttribute('aria-label', 'Stop blocks');
      myGlobal.runStopButton.setAttribute('aria-pressed', 'true');
      label.textContent = 'Stop';
      icon.classList.remove('toolbar__icon--play');
      icon.classList.add('toolbar__icon--stop');
      return;
    }

    myGlobal.runStopButton.dataset.running = 'false';
    myGlobal.runStopButton.title = 'Run blocks';
    myGlobal.runStopButton.setAttribute('aria-label', 'Run blocks');
    myGlobal.runStopButton.setAttribute('aria-pressed', 'false');
    label.textContent = 'Run';
    icon.classList.remove('toolbar__icon--stop');
    icon.classList.add('toolbar__icon--play');
  };

  myGlobal.updateControlState = function updateControlState() {
    const inProgramView = myGlobal.currentView === 'program' && Boolean(myGlobal.blockly_workspace);
    const disableWhileRunning = myGlobal.isRunning;

    myGlobal.runStopButton.disabled = !inProgramView;
    myGlobal.stepSlider.disabled = !inProgramView;
    myGlobal.highlightCheck.disabled = !inProgramView;
    myGlobal.uploadButton.disabled = !inProgramView || disableWhileRunning;
    myGlobal.mergeCheck.disabled = !inProgramView || disableWhileRunning;
    myGlobal.downloadButton.disabled = !inProgramView || disableWhileRunning;
    myGlobal.clearButton.disabled = !inProgramView || disableWhileRunning;
  };

  myGlobal.updateSplit = function updateSplit(clientX) {
    const rect = myGlobal.divider.parentElement.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    const next = myGlobal.clamp(raw, 15, 85);
    myGlobal.rootStyle.setProperty('--left-w', `${next}%`);
    if (myGlobal.blockly_workspace) {
      myGlobal.resizeBlocklyDiv();
    }
  };

  myGlobal.resizeBlocklyDiv = function resizeBlocklyDiv() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv || !myGlobal.leftContent || !myGlobal.leftPane) {
      return;
    }

    const paneStyle = window.getComputedStyle(myGlobal.leftPane);
    const panePadTop = parseFloat(paneStyle.paddingTop) || 0;
    const panePadBottom = parseFloat(paneStyle.paddingBottom) || 0;
    const panePadLeft = parseFloat(paneStyle.paddingLeft) || 0;
    const panePadRight = parseFloat(paneStyle.paddingRight) || 0;

    const availablePaneHeight = myGlobal.leftPane.clientHeight - panePadTop - panePadBottom;
    const availablePaneWidth = myGlobal.leftPane.clientWidth - panePadLeft - panePadRight;

    let siblingHeight = 0;
    Array.from(myGlobal.leftContent.children).forEach((elem) => {
      if (elem.id === 'blocklyDiv') {
        return;
      }
      const style = window.getComputedStyle(elem);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      siblingHeight += elem.offsetHeight + marginTop + marginBottom;
    });

    const verticalGap = 8;
    const width = Math.max(240, Math.floor(availablePaneWidth));
    const height = Math.max(220, Math.floor(availablePaneHeight - siblingHeight - verticalGap));

    blocklyDiv.style.width = `${width}px`;
    blocklyDiv.style.height = `${height}px`;

    if (myGlobal.blockly_workspace) {
      Blockly.svgResize(myGlobal.blockly_workspace);
    }
  };

  myGlobal.stopExecution = function stopExecution(message = 'Stopped') {
    if (myGlobal.executionTimer) {
      window.clearTimeout(myGlobal.executionTimer);
      myGlobal.executionTimer = null;
    }
    myGlobal.currentInterpreter = null;
    myGlobal.isRunning = false;
    if (myGlobal.blockly_workspace) {
      myGlobal.blockly_workspace.highlightBlock(null);
    }
    myGlobal.updateRunButton();
    myGlobal.updateControlState();
    myGlobal.setStatus(message);
  };

  myGlobal.generateCode = function generateCode(addHighlight) {
    if (!myGlobal.blockly_workspace || !Blockly.JavaScript) {
      return '';
    }
    Blockly.JavaScript.addReservedWords('blockFuncs');
    Blockly.JavaScript.STATEMENT_PREFIX = addHighlight ? 'blockFuncs.highlightBlock(%1);\n' : null;
    const code = Blockly.JavaScript.workspaceToCode(myGlobal.blockly_workspace);
    Blockly.JavaScript.STATEMENT_PREFIX = null;
    return code;
  };

  myGlobal.runBlocks = function runBlocks() {
    if (!myGlobal.blockly_workspace || myGlobal.isRunning || typeof Interpreter === 'undefined') {
      return;
    }

    const code = myGlobal.generateCode(myGlobal.highlightCheck.checked);
    if (!code.trim()) {
      myGlobal.setStatus('No blocks to run');
      return;
    }

    const initApi = function initApi(interpreter, globalObject) {
      interpreter.setProperty(globalObject, 'blockFuncs', interpreter.nativeToPseudo(myGlobal.blockFuncs));
      interpreter.setProperty(
        globalObject,
        'alert',
        interpreter.createNativeFunction((text) => window.alert(text)),
      );
      interpreter.setProperty(
        globalObject,
        'prompt',
        interpreter.createNativeFunction((text) => window.prompt(text)),
      );
    };

    myGlobal.enableHighlight = myGlobal.highlightCheck.checked;
    myGlobal.currentInterpreter = new Interpreter(code, initApi);
    myGlobal.isRunning = true;
    myGlobal.updateRunButton();
    myGlobal.updateControlState();
    myGlobal.setStatus(`Running with step_num=${myGlobal.stepNum}`);

    const nextStep = function nextStep() {
      if (!myGlobal.isRunning || !myGlobal.currentInterpreter) {
        return;
      }

      let executed = 0;
      try {
        while (executed < myGlobal.stepNum) {
          const hasMoreCode = myGlobal.currentInterpreter.step();
          if (!hasMoreCode) {
            myGlobal.stopExecution('Run complete');
            return;
          }
          executed += 1;
        }
      } catch (error) {
        console.error(error);
        myGlobal.stopExecution(`Execution error: ${error.message}`);
        return;
      }

      myGlobal.executionTimer = window.setTimeout(nextStep, 120);
    };

    nextStep();
  };

  myGlobal.uploadBlocks = function uploadBlocks(file) {
    if (!file || !myGlobal.blockly_workspace) {
      return;
    }

    const reader = new FileReader();
    reader.onload = function onLoad() {
      const xml = Blockly.utils.xml.textToDom(reader.result);
      if (!myGlobal.mergeCheck.checked) {
        myGlobal.blockly_workspace.clear();
      }
      Blockly.Xml.domToWorkspace(xml, myGlobal.blockly_workspace);
      myGlobal.setStatus(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  myGlobal.downloadBlocks = function downloadBlocks() {
    if (!myGlobal.blockly_workspace) {
      return;
    }

    const xml = Blockly.Xml.workspaceToDom(myGlobal.blockly_workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    const blob = new Blob([xmlText], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    document.body.appendChild(link);
    link.download = 'uprog_blocks.xml';
    link.href = url;
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    myGlobal.setStatus('Workspace downloaded');
  };

  myGlobal.clearBlocks = function clearBlocks() {
    if (!myGlobal.blockly_workspace) {
      return;
    }
    myGlobal.blockly_workspace.clear();
    myGlobal.setStatus('Workspace cleared');
  };

  myGlobal.createWorkspace = function createWorkspace() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv || typeof Blockly === 'undefined' || typeof Blockly.inject !== 'function') {
      myGlobal.setStatus('Blockly failed to initialize');
      return;
    }

    if (myGlobal.blockly_workspace) {
      myGlobal.blockly_workspace.dispose();
    }

    myGlobal.blockly_workspace = Blockly.inject('blocklyDiv', {
      toolbox: document.getElementById('toolbox'),
    });
    myGlobal.resizeBlocklyDiv();
  };

  myGlobal.setView = function setView(name) {
    const view = myGlobal.views[name] || myGlobal.views.program;

    if (myGlobal.currentView === 'program' && name !== 'program') {
      myGlobal.stopExecution('Stopped');
      if (myGlobal.blockly_workspace) {
        myGlobal.blockly_workspace.dispose();
        myGlobal.blockly_workspace = null;
      }
    }

    myGlobal.currentView = myGlobal.views[name] ? name : 'program';
    myGlobal.leftContent.innerHTML = view.left;
    myGlobal.rightContent.innerHTML = view.right;

    if (myGlobal.currentView === 'program') {
      myGlobal.createWorkspace();
      myGlobal.setStatus('Program view ready');
    }

    myGlobal.navButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.view === myGlobal.currentView);
    });
    myGlobal.updateControlState();
  };

  myGlobal.divider.addEventListener('pointerdown', (event) => {
    myGlobal.dragging = true;
    myGlobal.divider.setPointerCapture(event.pointerId);
  });

  myGlobal.divider.addEventListener('pointermove', (event) => {
    if (!myGlobal.dragging) {
      return;
    }
    myGlobal.updateSplit(event.clientX);
  });

  myGlobal.divider.addEventListener('pointerup', (event) => {
    myGlobal.dragging = false;
    myGlobal.divider.releasePointerCapture(event.pointerId);
  });

  myGlobal.divider.addEventListener('pointercancel', (event) => {
    myGlobal.dragging = false;
    myGlobal.divider.releasePointerCapture(event.pointerId);
  });

  myGlobal.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      myGlobal.setView(button.dataset.view);
    });
  });

  myGlobal.runStopButton.addEventListener('click', () => {
    if (myGlobal.isRunning) {
      myGlobal.stopExecution('Stopped');
      return;
    }
    myGlobal.runBlocks();
  });

  myGlobal.stepSlider.addEventListener('input', (event) => {
    myGlobal.stepNum = Number(event.target.value) || 1;
    myGlobal.stepValue.textContent = String(myGlobal.stepNum);
    if (!myGlobal.isRunning) {
      myGlobal.setStatus(`step_num=${myGlobal.stepNum}`);
    }
  });

  myGlobal.highlightCheck.addEventListener('change', (event) => {
    myGlobal.enableHighlight = event.target.checked;
    if (!myGlobal.enableHighlight && myGlobal.blockly_workspace) {
      myGlobal.blockly_workspace.highlightBlock(null);
    }
    myGlobal.setStatus(`Highlight ${myGlobal.enableHighlight ? 'enabled' : 'disabled'}`);
  });

  myGlobal.uploadButton.addEventListener('click', () => {
    myGlobal.uploadFileInput.click();
  });

  myGlobal.uploadFileInput.addEventListener('change', (event) => {
    const [file] = event.target.files;
    myGlobal.uploadBlocks(file);
    event.target.value = '';
  });

  myGlobal.downloadButton.addEventListener('click', () => {
    myGlobal.downloadBlocks();
  });

  myGlobal.clearButton.addEventListener('click', () => {
    myGlobal.clearBlocks();
  });

  window.addEventListener('resize', () => {
    if (myGlobal.blockly_workspace) {
      myGlobal.resizeBlocklyDiv();
    }
  });

  myGlobal.updateRunButton();
  myGlobal.stepValue.textContent = String(myGlobal.stepNum);
  myGlobal.setView('program');
}

