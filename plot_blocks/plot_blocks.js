// blocks for plot

Blockly.Blocks['plot_set_axes'] = {
  init: function() {
    this.appendValueInput('x_min')
      .setCheck('Number')
      .appendField('plot config x_range');
    this.appendValueInput('x_max')
      .setCheck('Number')
      .appendField('from');
    this.appendValueInput('y_min')
      .setCheck('Number')
      .appendField('y range');
    this.appendValueInput('y_max')
      .setCheck('Number')
      .appendField('from');
    this.appendValueInput('x_step')
      .setCheck('Number')
      .appendField('x ticks');
    this.appendValueInput('y_step')
      .setCheck('Number')
      .appendField('y ticks');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('robot_blocks');
    this.setTooltip('x/y軸の表示範囲と目盛りを設定します。');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['plot_point'] = {
  init: function() {
    this.appendValueInput('x')
      .setCheck('Number')
      .appendField('plot x');
    this.appendValueInput('y')
      .setCheck('Number')
      .appendField('y');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('robot_blocks');
    this.setTooltip('点を1つ描画します。');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['plot_line_segment'] = {
  init: function() {
    this.appendValueInput('x1')
      .setCheck('Number')
      .appendField('line x1');
    this.appendValueInput('y1')
      .setCheck('Number')
      .appendField('y1');
    this.appendValueInput('x2')
      .setCheck('Number')
      .appendField('x2');
    this.appendValueInput('y2')
      .setCheck('Number')
      .appendField('y2');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('robot_blocks');
    this.setTooltip('2点を結ぶ直線を描画します。');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['plot_arrow_segment'] = {
  init: function() {
    this.appendValueInput('x1')
      .setCheck('Number')
      .appendField('arrow x1');
    this.appendValueInput('y1')
      .setCheck('Number')
      .appendField('y1');
    this.appendValueInput('x2')
      .setCheck('Number')
      .appendField('x2');
    this.appendValueInput('y2')
      .setCheck('Number')
      .appendField('y2');
    this.appendValueInput('arrow_size')
      .setCheck('Number')
      .appendField('size');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('robot_blocks');
    this.setTooltip('始点から終点へ向かう矢印を描画します。');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['plot_clear'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('clear plots');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('robot_blocks');
    this.setTooltip('現在の描画をクリアします。');
    this.setHelpUrl('');
  }
};

javascript.javascriptGenerator.forBlock['plot_set_axes'] = function(block, generator) {
  var value_x_min = generator.valueToCode(block, 'x_min', javascript.Order.NONE) || '0';
  var value_x_max = generator.valueToCode(block, 'x_max', javascript.Order.NONE) || '10';
  var value_y_min = generator.valueToCode(block, 'y_min', javascript.Order.NONE) || '0';
  var value_y_max = generator.valueToCode(block, 'y_max', javascript.Order.NONE) || '10';
  var value_x_step = generator.valueToCode(block, 'x_step', javascript.Order.NONE) || '1';
  var value_y_step = generator.valueToCode(block, 'y_step', javascript.Order.NONE) || '1';
  var code = 'progFuncs.set_plot_range(' + value_x_min + ', ' + value_x_max + ', ' + value_y_min + ', ' + value_y_max + ');\n'
    + 'progFuncs.set_plot_ticks(' + value_x_step + ', ' + value_y_step + ');\n';
  return code;
};

javascript.javascriptGenerator.forBlock['plot_point'] = function(block, generator) {
  var value_x = generator.valueToCode(block, 'x', javascript.Order.NONE) || '0';
  var value_y = generator.valueToCode(block, 'y', javascript.Order.NONE) || '0';
  return 'progFuncs.point(' + value_x + ', ' + value_y + ');\n';
};

javascript.javascriptGenerator.forBlock['plot_line_segment'] = function(block, generator) {
  var value_x1 = generator.valueToCode(block, 'x1', javascript.Order.NONE) || '0';
  var value_y1 = generator.valueToCode(block, 'y1', javascript.Order.NONE) || '0';
  var value_x2 = generator.valueToCode(block, 'x2', javascript.Order.NONE) || '0';
  var value_y2 = generator.valueToCode(block, 'y2', javascript.Order.NONE) || '0';
  return 'progFuncs.line(' + value_x1 + ', ' + value_y1 + ', ' + value_x2 + ', ' + value_y2 + ');\n';
};

javascript.javascriptGenerator.forBlock['plot_arrow_segment'] = function(block, generator) {
  var value_x1 = generator.valueToCode(block, 'x1', javascript.Order.NONE) || '0';
  var value_y1 = generator.valueToCode(block, 'y1', javascript.Order.NONE) || '0';
  var value_x2 = generator.valueToCode(block, 'x2', javascript.Order.NONE) || '1';
  var value_y2 = generator.valueToCode(block, 'y2', javascript.Order.NONE) || '0';
  var value_arrow_size = generator.valueToCode(block, 'arrow_size', javascript.Order.NONE) || '0.5';
  var code = 'progFuncs.arrow(' + value_x1 + ', ' + value_y1 + ', ' + value_x2 + ', ' + value_y2 + ', ' + value_arrow_size + ');\n';
  return code;
};

javascript.javascriptGenerator.forBlock['plot_clear'] = function(block, generator) {
  return 'progFuncs.plot_clear();\n';
};
