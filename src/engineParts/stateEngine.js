"use strict";
exports.__esModule = true;
var idGenerator_1 = require("../utils/idGenerator");
function stateEngine() {
    var currentState = "";
    var statusListeners = new Map();
    var configuredStates = new Map();
    function setStates(newStates) {
        if (newStates.length === 0) {
            throw new Error("Cannot initialize Joki State Engine with 0 states");
        }
        newStates.forEach(function (st) {
            configuredStates.set(st.state, st);
            if (st.initial === true) {
                currentState = st.state;
            }
        });
        if (currentState === "") {
            currentState = newStates[0].state;
        }
    }
    function get(api) {
        return createJokiStateFrom(currentState, api);
    }
    function createJokiStateFrom(state, api) {
        var rule = configuredStates.get(state);
        var js = {
            state: rule.state,
            validNext: rule.validNext
        };
        if (rule.onNext) {
            js.next = function () {
                change(rule.onNext, api);
            };
        }
        if (rule.onError) {
            js.error = function () {
                change(rule.onError, api);
            };
        }
        return js;
    }
    function change(newState, api) {
        var currentRule = configuredStates.get(currentState);
        if (!currentRule.validNext.includes(newState)) {
            throw new Error(newState + " is not a valid state to move forward from " + currentState + ". Valid options are: " + currentRule.validNext.join(", "));
        }
        var newRule = configuredStates.get(newState);
        if (newRule) {
            currentState = newRule.state;
            var newJokiState_1 = createJokiStateFrom(newRule.state, api);
            statusListeners.forEach(function (listener) {
                listener.fn(newJokiState_1);
            });
            api.trigger({
                from: "JOKI.STATEENGINE",
                action: "StateChanged",
                data: currentState
            });
        }
    }
    function listen(fn) {
        var li = {
            id: idGenerator_1["default"](),
            fn: fn
        };
        statusListeners.set(li.id, li);
        return function () {
            statusListeners["delete"](li.id);
        };
    }
    return {
        get: get,
        setStates: setStates,
        change: change,
        listen: listen
    };
}
exports["default"] = stateEngine;
