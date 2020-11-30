"use strict";
exports.__esModule = true;
var idNumber = 0;
function idGen(pre) {
    return "id-" + pre + "-" + idNumber++;
}
exports["default"] = idGen;
