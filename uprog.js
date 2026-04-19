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
  myGlobal.workspaceXmlByView = {
    program: '',
    plot: '',
    notes: '',
  };

  myGlobal.defineTheme = function defineTheme(name, palette) {
    if (typeof Blockly === 'undefined' || !Blockly.Theme || !Blockly.Themes) {
      return null;
    }

    return Blockly.Theme.defineTheme(name, {
      base: Blockly.Themes.Classic,
      blockStyles: {
        logic_blocks: {
          colourPrimary: palette.logicPrimary,
          colourSecondary: palette.logicSecondary,
          colourTertiary: palette.logicTertiary,
        },
        loop_blocks: {
          colourPrimary: palette.loopPrimary,
          colourSecondary: palette.loopSecondary,
          colourTertiary: palette.loopTertiary,
        },
        math_blocks: {
          colourPrimary: palette.mathPrimary,
          colourSecondary: palette.mathSecondary,
          colourTertiary: palette.mathTertiary,
        },
        text_blocks: {
          colourPrimary: palette.textPrimary,
          colourSecondary: palette.textSecondary,
          colourTertiary: palette.textTertiary,
        },
        variable_blocks: {
          colourPrimary: palette.variablePrimary,
          colourSecondary: palette.variableSecondary,
          colourTertiary: palette.variableTertiary,
        },
        procedure_blocks: {
          colourPrimary: palette.procedurePrimary,
          colourSecondary: palette.procedureSecondary,
          colourTertiary: palette.procedureTertiary,
        },
      },
      componentStyles: {
        workspaceBackgroundColour: palette.workspaceBackgroundColour,
        toolboxBackgroundColour: palette.toolboxBackgroundColour,
        toolboxForegroundColour: palette.toolboxForegroundColour,
        flyoutBackgroundColour: palette.flyoutBackgroundColour,
        flyoutForegroundColour: palette.flyoutForegroundColour,
        flyoutOpacity: 0.94,
        scrollbarColour: palette.scrollbarColour,
        insertionMarkerColour: palette.insertionMarkerColour,
        insertionMarkerOpacity: 0.25,
        scrollbarOpacity: 0.45,
        cursorColour: palette.cursorColour,
        blackBackground: palette.blackBackground,
      },
      fontStyle: {
        family: 'Georgia, Times New Roman, serif',
      },
      startHats: null,
    });
  };

  myGlobal.workspaceThemes = {
    program: typeof my_theme !== 'undefined' ? my_theme : Blockly.Themes.Classic,
    plot: myGlobal.defineTheme('uprog_plot_theme', {
      logicPrimary: '#4d7fa8',
      logicSecondary: '#d6e7f4',
      logicTertiary: '#365c7d',
      loopPrimary: '#5c9a8f',
      loopSecondary: '#d9efeb',
      loopTertiary: '#3f6f67',
      mathPrimary: '#6b6fb4',
      mathSecondary: '#dfe0f8',
      mathTertiary: '#4e5287',
      textPrimary: '#4f92a1',
      textSecondary: '#d9edf1',
      textTertiary: '#3a6a74',
      variablePrimary: '#8d68b3',
      variableSecondary: '#e8def5',
      variableTertiary: '#684d86',
      procedurePrimary: '#be6f91',
      procedureSecondary: '#f8e0eb',
      procedureTertiary: '#8f526d',
      workspaceBackgroundColour: '#edf6fd',
      toolboxBackgroundColour: '#d5e8f7',
      toolboxForegroundColour: '#1d4f71',
      flyoutBackgroundColour: '#f5fbff',
      flyoutForegroundColour: '#1d4f71',
      scrollbarColour: '#7da9c8',
      insertionMarkerColour: '#27577c',
      cursorColour: '#27577c',
      blackBackground: '#d8e8f3',
    }),
    notes: myGlobal.defineTheme('uprog_notes_theme', {
      logicPrimary: '#91713a',
      logicSecondary: '#f4ead2',
      logicTertiary: '#6f562b',
      loopPrimary: '#8d8050',
      loopSecondary: '#f2eedb',
      loopTertiary: '#6b613b',
      mathPrimary: '#a66a4d',
      mathSecondary: '#fae5d9',
      mathTertiary: '#7d4f3a',
      textPrimary: '#7f8c53',
      textSecondary: '#edf1db',
      textTertiary: '#5d693d',
      variablePrimary: '#8b6177',
      variableSecondary: '#f1dfe8',
      variableTertiary: '#68485a',
      procedurePrimary: '#6b7a92',
      procedureSecondary: '#dfe6f0',
      procedureTertiary: '#4f5a6c',
      workspaceBackgroundColour: '#fff8e4',
      toolboxBackgroundColour: '#f1e1b9',
      toolboxForegroundColour: '#6f5223',
      flyoutBackgroundColour: '#fffcee',
      flyoutForegroundColour: '#6f5223',
      scrollbarColour: '#c49b4e',
      insertionMarkerColour: '#8a6320',
      cursorColour: '#8a6320',
      blackBackground: '#ead8aa',
    }),
  };

  myGlobal.viewHasWorkspace = function viewHasWorkspace(name) {
    return ['program', 'plot', 'notes'].includes(name);
  };

  myGlobal.views = {
    program: {
      left: '<h3>Program Workspace</h3><div id="blocklyDiv"></div><p>The main programming workspace uses the default uProg theme.</p>',
      right: '<h3>Right: Checklist</h3><ul><li>Read the brief</li><li>Open the demo</li><li>Start coding</li></ul>',
    },
    plot: {
      left: '<h3>Plot Workspace</h3><div id="blocklyDiv"></div><p>This workspace uses a cooler palette so it is visually distinct from Prog.</p>',
      right: '<h3>Right: Output</h3><p>Try editing the code and run the sample.</p>',
    },
    notes: {
      left: '<h3>Notes Workspace</h3><div id="blocklyDiv"></div><p>This workspace uses a warmer note-like theme.</p>',
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
    const hasWorkspace = myGlobal.viewHasWorkspace(myGlobal.currentView) && Boolean(myGlobal.blockly_workspace);
    const disableWhileRunning = myGlobal.isRunning;

    myGlobal.runStopButton.disabled = !hasWorkspace;
    myGlobal.stepSlider.disabled = !hasWorkspace;
    myGlobal.highlightCheck.disabled = !hasWorkspace;
    myGlobal.uploadButton.disabled = !hasWorkspace || disableWhileRunning;
    myGlobal.mergeCheck.disabled = !hasWorkspace || disableWhileRunning;
    myGlobal.downloadButton.disabled = !hasWorkspace || disableWhileRunning;
    myGlobal.clearButton.disabled = !hasWorkspace || disableWhileRunning;
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

  myGlobal.saveCurrentWorkspace = function saveCurrentWorkspace() {
    if (!myGlobal.blockly_workspace || !myGlobal.viewHasWorkspace(myGlobal.currentView)) {
      return;
    }

    const xml = Blockly.Xml.workspaceToDom(myGlobal.blockly_workspace);
    myGlobal.workspaceXmlByView[myGlobal.currentView] = Blockly.Xml.domToText(xml);
  };

  myGlobal.restoreWorkspace = function restoreWorkspace(viewName) {
    const xmlText = myGlobal.workspaceXmlByView[viewName];
    if (!myGlobal.blockly_workspace || !xmlText) {
      return;
    }

    try {
      const xml = Blockly.utils.xml.textToDom(xmlText);
      Blockly.Xml.domToWorkspace(xml, myGlobal.blockly_workspace);
    } catch (error) {
      console.error(error);
      myGlobal.setStatus(`Failed to restore ${viewName} workspace`);
    }
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
      try {
        const xml = Blockly.utils.xml.textToDom(reader.result);
        if (!myGlobal.mergeCheck.checked) {
          myGlobal.blockly_workspace.clear();
        }
        Blockly.Xml.domToWorkspace(xml, myGlobal.blockly_workspace);
        myGlobal.saveCurrentWorkspace();
        myGlobal.setStatus(`Loaded ${file.name} into ${myGlobal.currentView}`);
      } catch (error) {
        console.error(error);
        myGlobal.setStatus(`Upload failed: ${error.message}`);
      }
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
    link.download = `uprog_${myGlobal.currentView}_blocks.xml`;
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
    myGlobal.saveCurrentWorkspace();
    myGlobal.setStatus('Workspace cleared');
  };

  myGlobal.createWorkspace = function createWorkspace(viewName = myGlobal.currentView) {
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv || typeof Blockly === 'undefined' || typeof Blockly.inject !== 'function') {
      myGlobal.setStatus('Blockly failed to initialize');
      return;
    }

    if (myGlobal.blockly_workspace) {
      myGlobal.blockly_workspace.dispose();
    }

    const profileTheme = myGlobal.workspaceThemes[viewName];
    const options = {
      toolbox: document.getElementById('toolbox'),
    };

    if (profileTheme) {
      options.theme = profileTheme;
    }

    myGlobal.blockly_workspace = Blockly.inject('blocklyDiv', options);
    myGlobal.blockly_workspace.addChangeListener((event) => {
      if (event && event.isUiEvent) {
        return;
      }
      myGlobal.saveCurrentWorkspace();
    });
    myGlobal.restoreWorkspace(viewName);
    myGlobal.resizeBlocklyDiv();
  };

  myGlobal.setView = function setView(name) {
    const nextView = myGlobal.views[name] ? name : 'program';
    const view = myGlobal.views[nextView];

    if (myGlobal.currentView === nextView) {
      return;
    }

    if (myGlobal.isRunning && myGlobal.currentView !== nextView) {
      myGlobal.stopExecution('Stopped');
    }

    if (myGlobal.blockly_workspace) {
      myGlobal.saveCurrentWorkspace();
      myGlobal.blockly_workspace.dispose();
      myGlobal.blockly_workspace = null;
    }

    myGlobal.currentView = nextView;
    myGlobal.leftContent.innerHTML = view.left;
    myGlobal.rightContent.innerHTML = view.right;

    if (myGlobal.viewHasWorkspace(myGlobal.currentView)) {
      myGlobal.createWorkspace(myGlobal.currentView);
      myGlobal.setStatus(`${myGlobal.currentView} workspace ready`);
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

