(function registerProgramMode(myGlobal) {
  if (!myGlobal) {
    return;
  }

  myGlobal.getProgramModeRightPane = function getProgramModeRightPane() {
    return [
      '<section class="program-mode" aria-label="program mode controls">',
      '  <div class="program-mode__actions">',
      '    <button class="toolbar__button" id="run-no-step-button" type="button">Run no-step</button>',
      '    <button class="toolbar__button" id="show-script-button" type="button">Show script</button>',
      '    <button class="toolbar__button" id="download-script-button" type="button">Download script</button>',
      '    <button class="toolbar__button" id="clear-console-button" type="button">Clear console</button>',
      '  </div>',
      '  <textarea class="program-mode__console" id="console-string" spellcheck="false"></textarea>',
      '</section>',
    ].join('');
  };

  myGlobal.getProgramConsole = function getProgramConsole() {
    return document.getElementById('console-string');
  };

  myGlobal.getProgramModeScript = function getProgramModeScript(addHighlight = false) {
    if (!myGlobal.blockly_workspace || typeof Blockly === 'undefined' || !Blockly.JavaScript) {
      return '';
    }

    if (typeof myGlobal.generateCode === 'function') {
      return myGlobal.generateCode(addHighlight);
    }

    return Blockly.JavaScript.workspaceToCode(myGlobal.blockly_workspace);
  };

  myGlobal.clearProgramConsole = function clearProgramConsole() {
    const consoleArea = myGlobal.getProgramConsole();
    if (consoleArea) {
      consoleArea.value = '';
    }
    if (typeof myGlobal.setStatus === 'function') {
      myGlobal.setStatus('Console cleared');
    }
  };

  myGlobal.showProgramScript = function showProgramScript() {
    const includeHighlight = Boolean(myGlobal.highlightCheck && myGlobal.highlightCheck.checked);
    const code = myGlobal.getProgramModeScript(includeHighlight);
    const consoleArea = myGlobal.getProgramConsole();

    if (!code.trim()) {
      if (typeof myGlobal.setStatus === 'function') {
        myGlobal.setStatus('No script to show');
      }
      return;
    }

    if (consoleArea) {
      consoleArea.value = code;
    }
    if (typeof myGlobal.setStatus === 'function') {
      myGlobal.setStatus('Script shown in console');
    }
  };

  myGlobal.downloadProgramScript = function downloadProgramScript() {
    const includeHighlight = Boolean(myGlobal.highlightCheck && myGlobal.highlightCheck.checked);
    const code = myGlobal.getProgramModeScript(includeHighlight);
    if (!code.trim()) {
      if (typeof myGlobal.setStatus === 'function') {
        myGlobal.setStatus('No script to download');
      }
      return;
    }

    const blob = new Blob([code], { type: 'text/javascript' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    document.body.appendChild(link);
    link.download = 'irsl_prog.js';
    link.href = url;
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    if (typeof myGlobal.setStatus === 'function') {
      myGlobal.setStatus('Script downloaded');
    }
  };

  myGlobal.runBlocksNoStep = function runBlocksNoStep() {
    if (!myGlobal.blockly_workspace || typeof progFuncs === 'undefined') {
      return;
    }

    const code = myGlobal.getProgramModeScript(false);
    if (!code.trim()) {
      if (typeof myGlobal.setStatus === 'function') {
        myGlobal.setStatus('No blocks to run');
      }
      return;
    }

    if (myGlobal.isRunning && typeof myGlobal.stopExecution === 'function') {
      myGlobal.stopExecution('Stopped');
    }

    myGlobal.isRunning = true;
    if (typeof myGlobal.updateRunButton === 'function') {
      myGlobal.updateRunButton();
    }
    if (typeof myGlobal.updateControlState === 'function') {
      myGlobal.updateControlState();
    }
    if (typeof myGlobal.setStatus === 'function') {
      myGlobal.setStatus('Running without steps');
    }

    try {
      const execute = new Function('progFuncs', 'alert', 'prompt', code);
      execute(progFuncs, window.alert.bind(window), window.prompt.bind(window));
      if (typeof myGlobal.setStatus === 'function') {
        myGlobal.setStatus('Run complete');
      }
    } catch (error) {
      console.error(error);
      if (typeof myGlobal.setStatus === 'function') {
        myGlobal.setStatus(`Execution error: ${error.message}`);
      }
    } finally {
      myGlobal.isRunning = false;
      if (myGlobal.blockly_workspace) {
        myGlobal.blockly_workspace.highlightBlock(null);
      }
      if (typeof myGlobal.updateRunButton === 'function') {
        myGlobal.updateRunButton();
      }
      if (typeof myGlobal.updateControlState === 'function') {
        myGlobal.updateControlState();
      }
    }
  };

  myGlobal.setupProgramModePane = function setupProgramModePane() {
    const runNoStepButton = document.getElementById('run-no-step-button');
    const showScriptButton = document.getElementById('show-script-button');
    const downloadScriptButton = document.getElementById('download-script-button');
    const clearConsoleButton = document.getElementById('clear-console-button');

    if (runNoStepButton) {
      runNoStepButton.addEventListener('click', () => {
        myGlobal.runBlocksNoStep();
      });
    }
    if (showScriptButton) {
      showScriptButton.addEventListener('click', () => {
        myGlobal.showProgramScript();
      });
    }
    if (downloadScriptButton) {
      downloadScriptButton.addEventListener('click', () => {
        myGlobal.downloadProgramScript();
      });
    }
    if (clearConsoleButton) {
      clearConsoleButton.addEventListener('click', () => {
        myGlobal.clearProgramConsole();
      });
    }
  };
})(typeof myGlobal === 'undefined' ? null : myGlobal);
