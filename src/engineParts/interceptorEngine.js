"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var idGenerator_1 = require("../utils/idGenerator");
function interceptorEngine() {
    var interceptors = [];
    function add(interceptor) {
        var id = idGenerator_1["default"]("pro");
        var pro = __assign(__assign({}, interceptor), { _id: id });
        interceptors.push(pro);
        return pro._id;
    }
    function remove(id) {
        interceptors = interceptors.filter(function (p) { return p._id !== id; });
    }
    function run(event, api) {
        var newEvent = interceptors.reduce(function (ev, interceptor) {
            var execute = false;
            if (interceptor.to && ev.to) {
                if (interceptor.to === ev.to) {
                    execute = true;
                }
                else {
                    return ev;
                }
            }
            if (interceptor.from && ev.from) {
                if (interceptor.from === ev.from) {
                    execute = true;
                }
                else {
                    return ev;
                }
            }
            if (interceptor.action && ev.action) {
                if (interceptor.action === ev.action) {
                    execute = true;
                }
                else {
                    return ev;
                }
            }
            if (interceptor.to === undefined && interceptor.from === undefined && interceptor.action === undefined)
                execute = true;
            api.log("DEBUG", "Interceptor:Run : E" + execute, [interceptor, event]);
            if (execute) {
                return interceptor.fn(ev, api);
            }
            return ev;
        }, __assign({}, event));
        return Object.freeze(newEvent);
    }
    return {
        add: add,
        remove: remove,
        run: run
    };
}
exports["default"] = interceptorEngine;
