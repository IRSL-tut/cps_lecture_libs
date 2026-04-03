function initializeUprog(myGlobal) {
  myGlobal.rootStyle = document.documentElement.style;
  myGlobal.leftPane = document.getElementById('leftPane');
  myGlobal.rightPane = document.getElementById('rightPane');
  myGlobal.leftContent = document.getElementById('leftContent');
  myGlobal.rightContent = document.getElementById('rightContent');
  myGlobal.divider = document.getElementById('divider');
  myGlobal.buttons = document.querySelectorAll('.toolbar__button');
  myGlobal.dragging = false;

  myGlobal.views = {
    intro: {
      left: "<h3>Left: Overview</h3><div id=\"blocklyDiv\"></div><p>Welcome to uProg. Use the divider to resize the panels.</p>",
      right: "<h3>Right: Checklist</h3><ul><li>Read the brief</li><li>Open the demo</li><li>Start coding</li></ul>"
    },
    demo: {
      left: "<h3>Left: Demo Code</h3><pre>function add(a, b) {\n  return a + b;\n}</pre>",
      right: "<h3>Right: Output</h3><p>Try editing the code and run the sample.</p>"
    },
    notes: {
      left: "<h3>Left: Notes</h3><p>Keep your notes here for quick reference.</p>",
      right: "<h3>Right: Tasks</h3><ol><li>Test the API</li><li>Record results</li><li>Share feedback</li></ol>"
    }
  };

  myGlobal.clamp = function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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

  myGlobal.setView = function setView(name) {
    const view = myGlobal.views[name] || myGlobal.views.intro;
    myGlobal.leftContent.innerHTML = view.left;
    myGlobal.rightContent.innerHTML = view.right;
    if (name === 'intro') {
      if (myGlobal.blockly_workspace) {
        myGlobal.blockly_workspace.dispose();
      }
      myGlobal.blockly_workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
      });
      myGlobal.resizeBlocklyDiv();
    }
    myGlobal.buttons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.view === name);
    });
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

  myGlobal.buttons.forEach((button) => {
    button.addEventListener('click', () => {
      myGlobal.setView(button.dataset.view);
    });
  });

  window.addEventListener('resize', () => {
    if (myGlobal.blockly_workspace) {
      myGlobal.resizeBlocklyDiv();
    }
  });

  myGlobal.setView('intro');
}

