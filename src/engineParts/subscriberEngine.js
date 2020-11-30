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
function subscriptionEngine() {
    var subscriptions = [];
    function add(subscriber) {
        var id = idGenerator_1["default"]("sub");
        var sub = __assign(__assign({}, subscriber), { id: id, once: false });
        subscriptions.push(sub);
        return function () {
            subscriptions = subscriptions.filter(function (s) { return s.id !== id; });
        };
    }
    function addOnce(subscriber) {
        var id = idGenerator_1["default"]("sub");
        var sub = __assign(__assign({}, subscriber), { id: id, once: true });
        subscriptions.push(sub);
        // return () => {
        //     subscriptions = subscriptions.filter((s: JokiSubscriptionInternal) => s.id !== id);
        // };
    }
    function run(event) {
        var subsDone = [];
        subscriptions.forEach(function (sub) {
            var execute = false;
            if (sub.name && event.to) {
                if (sub.name === event.to) {
                    execute = true;
                }
                else {
                    return;
                }
            }
            if (sub.from && event.from) {
                if (sub.from === event.from) {
                    execute = true;
                }
                else {
                    return;
                }
            }
            if (sub.action && event.action) {
                if (sub.action === event.action) {
                    execute = true;
                }
                else {
                    return;
                }
            }
            // If no limiting parameters are given, trigger on all
            if (sub.name === undefined && sub.from === undefined && sub.action === undefined)
                execute = true;
            if (execute) {
                if (sub.once) {
                    var done = sub.fn(event);
                    if (done === true) {
                        subsDone.push(sub.id);
                    }
                }
                else {
                    sub.fn(event);
                }
            }
        });
        if (subsDone.length > 0) {
            subscriptions = subscriptions.filter(function (s) { return !subsDone.includes(s.id); });
        }
    }
    return {
        add: add,
        addOnce: addOnce,
        run: run
    };
}
exports["default"] = subscriptionEngine;
