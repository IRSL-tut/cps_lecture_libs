// functions
var progFuncs = {};

function f_text_to_logic(instr) {
  var ins = instr.toLowerCase();
  if (ins == "1" || ins == "t" || ins == "true") {
    return true;
  }
  return false;
}
function f_text_to_number(instr) {
  return Number(instr);
}
function start_from(instr) {
  console.log("start_from: " + instr);
}
function end_with() {
  console.log("end_with:");
}
function write_string(str) {
  var elm = document.getElementById("console-string");
  elm.value += str;
  console.log(str);
}
function write_clear() {
  var elm = document.getElementById("console-string");
  elm.value = "";
}
function set_enable_highlight(enable) {
  myGloabl.enable_highlight = enable;
}
function my_highlight_block(id) {
  myGlobal.break_step += 1;
  if (myGlobal.enable_highlight) {
    return blockly_workspace.highlightBlock(id);
  }
}
function subscribe(topic, callback=null) {
  myGlobal.BM.msg_pool.subscribe(topic, callback);
}
function publish(topic, msg) {
  myGlobal.BM.msg_pool.publish(topic, msg);
}
function get_message(topic) {
  var msg = myGlobal.BM.msg_pool.getMessage(topic);
  if (msg) {
    return msg[1];
  }
  return null;
}
function get_last_message(topic) {
  var msg = myGlobal.BM.msg_pool.readLastMessage(topic, true);
  if (msg) {
    return msg[1];
  }
  return null;
}
function get_obj_key(obj, key)  {
  if (key in obj) {
    return obj[key];
  } else {
    return undefined;
  }
}
//
progFuncs.f_text_to_logic  = f_text_to_logic;
progFuncs.f_text_to_number = f_text_to_number;
//
progFuncs.start_from = start_from;
progFuncs.end_with   = end_with;
//
progFuncs.write_string = write_string;
progFuncs.write_clear  = write_clear;
//
progFuncs.set_enable_highlight = set_enable_highlight;
progFuncs.highlightBlock       = my_highlight_block;
//
progFuncs.subscribe = subscribe;
progFuncs.publish   = publish;
progFuncs.get_message = get_message;
progFuncs.get_last_message = get_last_message;
//
progFuncs.get_obj_key = get_obj_key;
