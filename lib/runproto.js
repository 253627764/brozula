var bcdef = require('./opcodes').bcdef;
var readDump = require('../lib/readdump');
var readProto = require('../lib/readproto');
var inspect = require('util').inspect;

// Takes a bytecode dump buffer and parses and return a function to run.
module.exports = function (buffer) {
  var protos = readDump(buffer).map(readProto);
  var code = [];

  protos.forEach(function (proto, protoIndex) {

    console.error(inspect(proto, false, 3, true));

    // Form the function header
    var line = "\nfunction " + pr(protoIndex) + "(";
    for (var i = 0; i < proto.numparams; i++) {
      if (i) line += ", ";
      line += param(i);
    }
    line += ") {";
    code.push(line);

    // Reserve the stack
    var line = "  var $, $$, ";
    for (var i = 0; i < proto.framesize; i++) {
      if (i) line += ", ";
      line += slot(i);
    }
    line += ";";
    code.push(line);

    code.push("  var state = " + stateLabel(0) + ";");
    code.push("  for(;;) {");
    code.push("    loop: switch(state) {");

    var state = {
      indent: "      "
    };

    // Scan for the blocks by looking for jump targets
    var targets = {"0":true};
    for (var i = 0, l = proto.bcins.length; i < l; i++) {
      var bc = proto.bcins[i];
      var def = bcdef[bc.op];
      Object.keys(def).forEach(function (key, j) {
        if (def[key] !== "jump") return;
        targets[bc.args[j]] = true;
      });
    }

    // Compile the opcodes
    for (var i = 0, l = proto.bcins.length; i < l; i++) {
      var bc = proto.bcins[i];
      if (targets[i]) {
        code.push("    case " + stateLabel(i) + ":");
      }


      console.error(inspect(bc, false, 3, true));
      var line = state.indent + opcodes[bc.op].apply(state, bc.args);
      if (bc.op === "ISF") {
        var next = proto.bcins[++i];
        line += " { " + opcodes[next.op].apply(state, next.args) + " }"
      }
      code.push(line);
    }
    code.push("    }\n  }");

    if (protoIndex < protos.length - 1) {
      code.push("},");
    }
    else {
      code.push("}\n");
    }
  });

  code.push("return " + pr(protos.length - 1) + ".apply(newState(), arguments);");

  return code.join("\n");

};

// Generate a variable name for a stack slot
function slot(i) {
  return "$" + i.toString(36);
}
function param(i) {
  return "_" + i.toString(36);
}
function pr(i) {
  return "fn" + i.toString(36);
}
function stateLabel(i) {
  return '"' + i.toString(36) + '"';
}
var ident = /^[a-z_$][a-z0-9_$]*$/;
var opcodes = {
  ISLT: function () {
    throw new Error("TODO: Implement me");
  },
  ISGE: function () {
    throw new Error("TODO: Implement me");
  },
  ISLE: function () {
    throw new Error("TODO: Implement me");
  },
  ISGT: function () {
    throw new Error("TODO: Implement me");
  },
  ISEQV: function () {
    throw new Error("TODO: Implement me");
  },
  ISNEV: function () {
    throw new Error("TODO: Implement me");
  },
  ISEQS: function () {
    throw new Error("TODO: Implement me");
  },
  ISNES: function () {
    throw new Error("TODO: Implement me");
  },
  ISEQN: function () {
    throw new Error("TODO: Implement me");
  },
  ISNEN: function () {
    throw new Error("TODO: Implement me");
  },
  ISEQP: function () {
    throw new Error("TODO: Implement me");
  },
  ISNEP: function () {
    throw new Error("TODO: Implement me");
  },
  ISTC: function () {
    throw new Error("TODO: Implement me");
  },
  ISFC: function () {
    throw new Error("TODO: Implement me");
  },
  IST: function () {
    throw new Error("TODO: Implement me");
  },
  ISF: function (d) {
    return "if (falsy(" + slot(d) + "))";
  },
  MOV: function () {
    throw new Error("TODO: Implement me");
  },
  NOT: function () {
    throw new Error("TODO: Implement me");
  },
  UNM: function () {
    throw new Error("TODO: Implement me");
  },
  LEN: function () {
    throw new Error("TODO: Implement me");
  },
  ADDVN: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " + " + c + ";";
  },
  SUBVN: function () {
    throw new Error("TODO: Implement me");
  },
  MULVN: function () {
    throw new Error("TODO: Implement me");
  },
  DIVVN: function () {
    throw new Error("TODO: Implement me");
  },
  MODVN: function () {
    throw new Error("TODO: Implement me");
  },
  ADDNV: function () {
    throw new Error("TODO: Implement me");
  },
  SUBNV: function () {
    throw new Error("TODO: Implement me");
  },
  MULNV: function () {
    throw new Error("TODO: Implement me");
  },
  DIVNV: function () {
    throw new Error("TODO: Implement me");
  },
  MODNV: function () {
    throw new Error("TODO: Implement me");
  },
  ADDVV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + " + " + slot(c) + ";";
  },
  SUBVV: function () {
    throw new Error("TODO: Implement me");
  },
  MULVV: function () {
    throw new Error("TODO: Implement me");
  },
  DIVVV: function () {
    throw new Error("TODO: Implement me");
  },
  MODVV: function () {
    throw new Error("TODO: Implement me");
  },
  POW: function () {
    throw new Error("TODO: Implement me");
  },
  CAT: function () {
    throw new Error("TODO: Implement me");
  },
  KSTR: function (a, d) {
    return slot(a) + " = " + JSON.stringify(d) + ";";
  },
  KCDATA: function (a, d) {
    throw new Error("TODO: Implement me");
  },
  KSHORT: function (a, d) {
    return slot(a) + " = 0x" + d.toString(16) + ";";
  },
  KNUM: function (a, d) {
    return slot(a) + " = " + d + ";";
  },
  KPRI: function (a, d) {
    return slot(a) + " = " + JSON.stringify(d) + ";";
  },
  KNIL: function (a, d) {
    var line = "";
    while (a <= d) {
      line += slot(a) + " = null;";
      if (a < d) line += "\n" + this.indent;
    }
    return line;
  },
  UGET: function () {
    throw new Error("TODO: Implement me");
  },
  USETV: function () {
    throw new Error("TODO: Implement me");
  },
  USETS: function () {
    throw new Error("TODO: Implement me");
  },
  USETN: function () {
    throw new Error("TODO: Implement me");
  },
  USETP: function () {
    throw new Error("TODO: Implement me");
  },
  UCLO: function () {
    throw new Error("TODO: Implement me");
  },
  FNEW: function (a, d) {

    throw new Error("TODO: Implement me");
  },
  TNEW: function (a, d) {
    var arrayn = d & 0x7ff;
    var hashn = d >>> 11;
    if (!arrayn || hashn) return slot(a) + " = {};";
    return slot(a) + " = new Array(" + arrayn + ");";
  },
  TDUP: function (a, d) {
    // TODO: handle more table types properly
    return slot(a) + " = " + JSON.stringify(d) + ";";
  },
  GGET: function (a, d) {
    if (ident.test(d))
      return slot(a) + " = this." + d + " || null;";
    else
      return slot(a) + " = this[" + JSON.stringify(d) + "] || null;";
  },
  GSET: function (a, d) {
    if (ident.test(d))
      return "this." + d + " = " + slot(a) + ";";
    else
      return "this[" + JSON.stringfy(d) + "] = " + slot(a) + ";";
  },
  TGETV: function (a, b, c) {
    return slot(a) + " = " + slot(b) + "[" + slot(c) + "] || null;";
  },
  TGETS: function (a, b, c) {
    if (ident.test(c))
      return slot(a) + " = " + slot(b) + "." + c + " || null;";
    else
      return slot(a) + " = " + slot(b) + "[" + JSON.stringify(c) + "] || null;";
  },
  TGETB: function (a, b, c) {
    return slot(a) + " = " + slot(b) + "[" + c + "] || null;";
  },
  TSETV: function (a, b, c) {
    return slot(b) + "[" + slot(c) + "] = " + slot(a) + ";";
  },
  TSETS: function (a, b, c) {
    if (ident.test(c))
      return slot(b) + "." + c + " = " + slot(a) + ";";
    else
      return slot(b) + "[" + JSON.stringify(c) + "] = " + slot(a) + ";";
  },
  TSETB: function (a, b, c) {
    return slot(b) + "[" + c + "] = " + slot(a) + ";";
  },
  TSETM: function () {
    throw new Error("TODO: Implement me");
  },
  CALLM: function (a, b, c) {
    var line;
    if (b > 1) { line = "$ = "; }
    else if (b == 0) { line = "$$ = "; }
    else { line = ""; }
    line += slot(a) + ".apply(null, [";
    if (c) {
      for (var i = a + 1; i <= a + c; i++) {
        if (i > a + 1) line += ", ";
        line += slot(i);
      }
      line += "].concat($$)";
    }
    else {
      line += slot(a) + "$$";
    }
    if (b === 1) {
      line += ");";
    }
    else {
      line += ") || [];";
    }
    if (b) {
      line += "\n" + this.indent + "$$ = undefined;";
    }
    if (b > 1) {
      for (var i = 0; i < b - 1; i++) {
        line += "\n" + this.indent + slot(a + i) + " = $[" + i + "];";
      }
      line += "\n" + this.indent + "$ = undefined;";
    }
    return line;
  },
  CALL: function (a, b, c) {
    var line;
    if (b > 1) { line = "$ = "; }
    else if (b == 0) { line = "$$ = "; }
    else { line = ""; }
    line += slot(a) + "(";
    for (var i = a + 1; i < a + c; i++) {
      if (i > a + 1) line += ", ";
      line += slot(i);
    }
    if (b === 1) {
      line += ");";
    }
    else {
      line += ") || [];";
    }
    if (b > 1) {
      for (var i = 0; i < b - 1; i++) {
        line += "\n" + this.indent + slot(a + i) + " = $[" + i + "];";
      }
      line += "\n" + this.indent + "$ = undefined;";
    }
    return line;
  },
  CALLMT: function () {
    throw new Error("TODO: Implement me");
  },
  CALLT: function () {
    throw new Error("TODO: Implement me");
  },
  ITERC: function () {
    throw new Error("TODO: Implement me");
  },
  ITERN: function () {
    throw new Error("TODO: Implement me");
  },
  VARG: function () {
    throw new Error("TODO: Implement me");
  },
  ISNEXT: function () {
    throw new Error("TODO: Implement me");
  },
  RETM: function () {
    throw new Error("TODO: Implement me");
  },
  RET: function () {
    throw new Error("TODO: Implement me");
  },
  RET0: function () {
    return "return [];";
  },
  RET1: function (a) {
    return "return [" + slot(a) + "];"
  },
  FORI: function () {
    throw new Error("TODO: Implement me");
  },
  JFORI: function () {
    throw new Error("TODO: Implement me");
  },
  FORL: function () {
    throw new Error("TODO: Implement me");
  },
  IFORL: function () {
    throw new Error("TODO: Implement me");
  },
  JFORL: function () {
    throw new Error("TODO: Implement me");
  },
  ITERL: function () {
    throw new Error("TODO: Implement me");
  },
  IITERL: function () {
    throw new Error("TODO: Implement me");
  },
  JITERL: function () {
    throw new Error("TODO: Implement me");
  },
  LOOP: function () {
    return "// LOOP";
  },
  ILOOP: function () {
    throw new Error("TODO: Implement me");
  },
  JLOOP: function () {
    throw new Error("TODO: Implement me");
  },
  JMP: function (a, d) {
    return "state = " + stateLabel(d) + "; break loop;";
  },
  FUNCF: function () {
    throw new Error("TODO: Implement me");
  },
  IFUNCF: function () {
    throw new Error("TODO: Implement me");
  },
  JFUNCF: function () {
    throw new Error("TODO: Implement me");
  },
  FUNCV: function () {
    throw new Error("TODO: Implement me");
  },
  IFUNCV: function () {
    throw new Error("TODO: Implement me");
  },
  JFUNCV: function () {
    throw new Error("TODO: Implement me");
  },
  FUNCC: function () {
    throw new Error("TODO: Implement me");
  },
  FUNCCW: function () {
    throw new Error("TODO: Implement me");
  }
};
