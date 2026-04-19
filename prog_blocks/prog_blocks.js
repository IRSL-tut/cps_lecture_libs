//Blockly.Blocks['getkey'] = {
//    init: function() {
//        this.appendDummyInput()
//            .appendField("getKey");
//        this.appendEndRowInput()
//            .appendField("async")
//            .appendField(new Blockly.FieldCheckbox("FALSE"), "async");
//        this.setOutput(true, null);
//        this.setStyle('robot_blocks')
//        this.setTooltip("");
//        this.setHelpUrl("");
//    },
//};
//Blockly.Blocks['getButton'] = {
//    init: function() {
//        this.appendDummyInput()
//            .appendField("getButton");
//        this.appendEndRowInput()
//            .appendField("async")
//            .appendField(new Blockly.FieldCheckbox("FALSE"), "async");
//        this.setOutput(true, null);
//        this.setStyle('robot_blocks')
//        this.setTooltip("");
//        this.setHelpUrl("");
//    },
//};
Blockly.Blocks['start_from'] = {
    init: function() {
        this.appendValueInput("intext")
            .setCheck(null)
            .appendField("startFrom");
        this.setNextStatement(true, null);
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['pass'] = {
    init: function() {
        this.appendValueInput("invalue")
            .setCheck(null)
            .appendField("pass");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['write_string'] = {
    init: function() {
        this.appendValueInput("intext")
            .setCheck(null)
            .appendField("write:String");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['write_newline'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("write:Newline");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['write_clear'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("write:Clear");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['end_with'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("endWith");
        this.setPreviousStatement(true, null);
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['text_to_logic'] = {
    init: function() {
        this.appendValueInput("intext")
            .setCheck("String")
            .appendField("text_to_logic");
        this.setOutput(true, "Boolean");
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['text_to_number'] = {
    init: function() {
        this.appendValueInput("intext")
            .setCheck("String")
            .appendField("text_to_number");
        this.setOutput(true, "Number");
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['high_light'] = {
    init: function() {
        this.appendEndRowInput()
            .appendField("highlight")
            .appendField(new Blockly.FieldCheckbox("FALSE"), "hl");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['MessageLoop'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("MessageLoop");
        this.appendStatementInput("message_loop")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('loop_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['is_list'] = {
    init: function() {
        this.appendValueInput("in_val")
            .appendField("Is list ?");
        this.setOutput(true, "Boolean");
        this.setStyle('robot_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
// message
Blockly.Blocks['subscribe'] = {
  init: function() {
        this.appendValueInput("topic")
            .setCheck(null)
            .appendField("subscribe:topic");
        this.appendValueInput("func")
            .setCheck(null)
            .appendField("callback");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('message_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['publish'] = {
  init: function() {
        this.appendValueInput("topic")
            .setCheck(null)
            .appendField("publish:topic");
        this.appendValueInput("msg")
            .setCheck(null)
            .appendField("message");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('message_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['get_message'] = {
    init: function() {
        this.appendValueInput("topic")
            .setCheck("String")
            .appendField("get_message:topic");
        this.setOutput(true, null);
        this.setStyle('message_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
Blockly.Blocks['get_last_message'] = {
    init: function() {
        this.appendValueInput("topic")
            .setCheck("String")
            .appendField("get_last_message:topic");
        this.setOutput(true, null);
        this.setStyle('message_blocks')
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
//Blockly.Blocks['get_id'] = {
//    init: function() {
//        this.appendDummyInput()
//            .appendField("getID");
//        this.setOutput(true, "String");
//        this.setStyle('message_blocks')
//        this.setTooltip("");
//        this.setHelpUrl("");
//    },
//};
//Blockly.Blocks['register_proc'] = {
//    init: function() {
//        this.appendValueInput("in_id")
//            .setCheck("String")
//            .appendField("registerProc : id");
//        this.appendValueInput("in_args")
//            .setCheck(null)
//            .appendField("args");
//        this.setPreviousStatement(true, null);
//        this.setNextStatement(true, null);
//        this.setStyle('message_blocks')
//        this.setTooltip("");
//        this.setHelpUrl("");
//    },
//};
//Blockly.Blocks['delete_proc'] = {
//    init: function() {
//        this.appendValueInput("in_id")
//            .setCheck("String")
//            .appendField("deleteProc : id");
//        this.setPreviousStatement(true, null);
//        this.setNextStatement(true, null);
//        this.setStyle('message_blocks')
//        this.setTooltip("");
//        this.setHelpUrl("");
//    },
//};
//Blockly.Blocks['do_proc'] = {
//    init: function() {
//        this.appendDummyInput()
//            .appendField("doProc");
//        this.setOutput(true, null);
//        this.setStyle('message_blocks')
//        this.setTooltip("");
//        this.setHelpUrl("");
//    },
//};
Blockly.Blocks['object_key'] = {
    init: function() {
      this.appendValueInput('invalue')
        .appendField('key:')
        .appendField(new Blockly.FieldTextInput('key'), 'key');
      this.setInputsInline(false);
      this.setOutput(true, null);
      this.setStyle('message_blocks');
      this.setTooltip("");
      this.setHelpUrl("");
    },
};
//
// code generations
//javascript.javascriptGenerator.forBlock['getkey'] = function(block, generator) {
//    var checkbox_async = block.getFieldValue('async') === 'TRUE';
//    var code = 'await myGetKey()';
//    // await myGetKey
//    // TODO: Change ORDER_NONE to the correct strength.
//    return [code, javascript.Order.NONE];
//};
//javascript.javascriptGenerator.forBlock['getButton'] = function(block, generator) {
//    var checkbox_async = block.getFieldValue('async') === 'TRUE';
//    var code = 'await getButton()';
//    // await myGetKey
//    // TODO: Change ORDER_NONE to the correct strength.
//    return [code, javascript.Order.NONE];
//};
javascript.javascriptGenerator.forBlock['start_from'] = function(block, generator) {
    var value_intext = generator.valueToCode(block, 'intext', javascript.Order.ATOMIC);
    var code = 'progFuncs.start_from(' + value_intext + ');\n';
    return code;
};
javascript.javascriptGenerator.forBlock['pass'] = function(block, generator) {
    var value_invalue = generator.valueToCode(block, 'invalue', javascript.Order.ATOMIC);
    var code = value_invalue + ';\n';
    return code;
};
javascript.javascriptGenerator.forBlock['end_with'] = function(block, generator) {
    var code = 'progFuncs.end_with();\n';
    return code;
};
javascript.javascriptGenerator.forBlock['write_string'] = function(block, generator) {
    var value_intext = generator.valueToCode(block, 'intext', javascript.Order.ATOMIC);
    var code = 'progFuncs.write_string(' + value_intext + ');\n';
    return code;
};
javascript.javascriptGenerator.forBlock['write_newline'] = function(block, generator) {
    var code = 'progFuncs.write_string("\\n");\n';
    return code;
};
javascript.javascriptGenerator.forBlock['write_clear'] = function(block, generator) {
    var code = 'progFuncs.write_clear();\n';
    return code;
};
javascript.javascriptGenerator.forBlock['pass'] = function(block, generator) {
    var value_invalue = generator.valueToCode(block, 'invalue', javascript.Order.ATOMIC);
    var code = value_invalue + ';\n';
    return code;
};
javascript.javascriptGenerator.forBlock['text_to_logic'] = function(block, generator) {
    var value_intext = generator.valueToCode(block, 'intext', javascript.Order.ATOMIC);
    var code = 'progFuncs.f_text_to_logic(' + value_intext + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascript.Order.NONE];
};
javascript.javascriptGenerator.forBlock['text_to_number'] = function(block, generator) {
    var value_intext = generator.valueToCode(block, 'intext', javascript.Order.ATOMIC);
    var code = 'progFuncs.f_text_to_number(' + value_intext + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascript.Order.NONE];
};
javascript.javascriptGenerator.forBlock['high_light'] = function(block, generator) {
    var checkbox_hl = block.getFieldValue('hl') === 'TRUE';
    var code = 'progFuncs.set_enable_highlight(' + checkbox_hl + ');\n';
    return code;
};
javascript.javascriptGenerator.forBlock['MessageLoop'] = function(block, generator) {
    var statements_ml = generator.statementToCode(block, 'message_loop');
    var code = '';
    code += 'function _subfunc (k) { var res=progFuncs.get_last_message(k); if(res){ _submap[k](res); } }\n';
    code += 'function process_message () { Object.keys(_submap).forEach(_subfunc); }\n\n';
    code += 'if (typeof _submap==="undefined") {  _submap = {}; }\n'
    code += 'while (true) { //>> MessageLoop \n  process_message();\n' + statements_ml + '\n} //<< MessageLoop';
    return code;
};
javascript.javascriptGenerator.forBlock['subscribe'] = function(block, generator) {
  let value_topic = generator.valueToCode(block, 'topic', javascript.Order.ATOMIC);
  let value_func = generator.valueToCode(block, 'func', javascript.Order.ATOMIC);
  var code = '';
  if (value_topic.length > 0) {
    if (value_func.length > 0) {
      const re = /\'([^\']*)\'/;
      var res = value_func.match(re);
      if (res) { value_func = res[1]; }
      code += 'if (typeof _submap==="undefined") {  _submap = {}; }\n'
      code += '_submap[' + value_topic + '] = ' + value_func + ';\n' + 'progFuncs.subscribe(' + value_topic + ');\n';
    } else {
      code += 'progFuncs.subscribe(' + value_topic + ');\n';
    }
  }
  return code;
};
javascript.javascriptGenerator.forBlock['publish'] = function(block, generator) {
  var value_topic = generator.valueToCode(block, 'topic', javascript.Order.ATOMIC);
  var value_msg = generator.valueToCode(block, 'msg', javascript.Order.ATOMIC);
  var code = 'progFuncs.publish(' + value_topic + ', ' + value_msg + ');\n';
  return code;
};
javascript.javascriptGenerator.forBlock['get_message'] = function(block, generator) {
  var value_topic = generator.valueToCode(block, 'topic', javascript.Order.ATOMIC);
  var code = 'progFuncs.get_message(' + value_topic + ')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, javascript.Order.NONE];
};
javascript.javascriptGenerator.forBlock['get_last_message'] = function(block, generator) {
  var value_topic = generator.valueToCode(block, 'topic', javascript.Order.ATOMIC);
  var code = 'progFuncs.get_last_message(' + value_topic + ')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, javascript.Order.NONE];
};
javascript.javascriptGenerator.forBlock['is_list'] = function(block, generator) {
  var in_val = generator.valueToCode(block, 'in_val', javascript.Order.ATOMIC);
  var code = 'Array.isArray(' + in_val + ')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, javascript.Order.NONE];
};
//javascript.javascriptGenerator.forBlock['get_id'] = function(block, generator) {
//  var code = 'progFuncs.get_id()';
//  // TODO: Change ORDER_NONE to the correct strength.
//  return [code, javascript.Order.NONE];
//};
//javascript.javascriptGenerator.forBlock['register_proc'] = function(block, generator) {
//  let v_id = generator.valueToCode(block, 'in_id', javascript.Order.ATOMIC);
//  let v_args = generator.valueToCode(block, 'in_args', javascript.Order.ATOMIC);
//  let code = "progFuncs.register_proc(" + v_id + ", " + v_args + ");\n";
//  return code;
//};
//javascript.javascriptGenerator.forBlock['delete_proc'] = function(block, generator) {
//  let v_id = generator.valueToCode(block, 'in_id', javascript.Order.ATOMIC);
//  let code = "progFuncs.delete_proc(" + v_id + ");\n";
//  return code;
//};
//javascript.javascriptGenerator.forBlock['do_proc'] = function(block, generator) {
//  var code = 'progFuncs.do_proc()';
//  // TODO: Change ORDER_NONE to the correct strength.
//  return [code, javascript.Order.NONE];
//};
javascript.javascriptGenerator.forBlock['object_key'] = function(block, generator) {
  const key = block.getFieldValue('key');
  const inv = generator.valueToCode(block, 'invalue', javascript.Order.ATOMIC);
  var code = 'progFuncs.get_obj_key(' + inv + ', "' + key + '")';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, javascript.Order.NONE];
};
