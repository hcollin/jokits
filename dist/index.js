(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.jokits = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var idNumber = 0;
    function idGen(pre) {
        return "id-" + pre + "-" + idNumber++;
    }

    function interceptorEngine() {
        var interceptors = [];
        function add(interceptor) {
            var id = idGen("pro");
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

    function subscriptionEngine() {
        var subscriptions = [];
        function add(subscriber) {
            var id = idGen("sub");
            var sub = __assign(__assign({}, subscriber), { id: id, once: false });
            subscriptions.push(sub);
            return function () {
                subscriptions = subscriptions.filter(function (s) { return s.id !== id; });
            };
        }
        function addOnce(subscriber) {
            var id = idGen("sub");
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

    function atomEngine() {
        var atoms = new Map();
        var atomSubId = 0;
        function subscribeToAtom(a, fn, once) {
            var id = "atomSub-" + atomSubId++;
            var atomCont = {
                id: id,
                fn: fn,
                once: once
            };
            a.subscribers.push(atomCont);
            return function () {
                a.subscribers = a.subscribers.filter(function (s) { return s.id !== id; });
            };
        }
        function updateAtomValue(at, value) {
            at.value = value;
            at.subscribers.forEach(function (sub) {
                sub.fn(value);
            });
        }
        function createAtomFromInteral(atomInt) {
            var atom = {
                id: atomInt.id,
                subscribe: function (fn, once) {
                    if (once === void 0) { once = false; }
                    return subscribeToAtom(atomInt, fn, once);
                },
                set: function (value) {
                    updateAtomValue(atomInt, value);
                },
                get: function () {
                    return atomInt.value;
                }
            };
            return atom;
        }
        function create(atomId, defaultValue) {
            var atomInt = {
                id: atomId,
                value: defaultValue,
                subscribers: []
            };
            if (atoms.has(atomId)) {
                return false;
            }
            atoms.set(atomId, atomInt);
            return true;
        }
        function get(atomId) {
            var atomInt = atoms.get(atomId);
            if (!atomInt) {
                return undefined;
            }
            return createAtomFromInteral(atomInt);
        }
        function remove(atomId) {
            var at = atoms.get(atomId);
            if (at) {
                updateAtomValue(at, undefined);
                atoms["delete"](atomId);
            }
            return;
        }
        function has(atomId) {
            return atoms.has(atomId);
        }
        return {
            create: create,
            get: get,
            remove: remove,
            has: has
        };
    }

    function serviceEngine() {
        var services = new Map();
        function add(serviceFactory, api) {
            if (services.has(serviceFactory.serviceId)) {
                throw new Error("Service with id " + serviceFactory.serviceId + " already exists");
            }
            var service = serviceFactory.service(serviceFactory.serviceId, api, serviceFactory.options);
            var cont = {
                id: serviceFactory.serviceId,
                service: service
            };
            services.set(serviceFactory.serviceId, cont);
        }
        function asyncRun(event) {
            return __awaiter(this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            res = run(event);
                            return [4 /*yield*/, res];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        function run(event) {
            // Targeted event!
            if (services.has(event.to)) {
                var service = services.get(event.to);
                return service.service.eventHandler(event);
            }
            var results = new Map();
            services.forEach(function (cont) {
                var res = cont.service.eventHandler(event);
                if (res !== undefined) {
                    results.set(cont.id, res);
                }
            });
            return results;
        }
        function remove(serviceId) {
            if (services.has(serviceId)) {
                services["delete"](serviceId);
            }
        }
        function list() {
            var serviceArr = Array.from(services.keys());
            return serviceArr;
        }
        function has(id) {
            return services.has(id);
        }
        function getServiceState(serviceId) {
            var service = services.get(serviceId);
            if (service) {
                return service.service.getState();
            }
            return undefined;
        }
        return {
            add: add,
            run: run,
            asyncRun: asyncRun,
            remove: remove,
            list: list,
            has: has,
            getServiceState: getServiceState
        };
    }

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
                id: idGen(),
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

    function createJoki(options) {
        var configs = {
            logger: "OFF",
            triggerEventOnStateChange: "OFF"
        };
        var INTERCEPTOR = interceptorEngine();
        var SUBSCRIBER = subscriptionEngine();
        var ATOMS = atomEngine();
        var SERVICES = serviceEngine();
        var STATEMACHINE = stateEngine();
        // MAIN FUNCTIONS
        function trigger(event) {
            var _this = this;
            _log("DEBUG", "TriggerEvent", event);
            if (event.async === true) {
                return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var ev;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, INTERCEPTOR.run(Object.freeze(event), internalApi())];
                            case 1:
                                ev = _a.sent();
                                return [4 /*yield*/, SUBSCRIBER.run(ev)];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, SERVICES.asyncRun(ev)];
                            case 3:
                                _a.sent();
                                resolve();
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
            else {
                var ev = INTERCEPTOR.run(Object.freeze(event), internalApi());
                SUBSCRIBER.run(ev);
                SERVICES.run(ev);
            }
        }
        function ask(event) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var ev, res, atom;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, INTERCEPTOR.run(Object.freeze(event), internalApi())];
                        case 1:
                            ev = _a.sent();
                            return [4 /*yield*/, SERVICES.run(ev)];
                        case 2:
                            res = _a.sent();
                            if (ev.to !== undefined) {
                                atom = ATOMS.get(ev.to);
                                if (atom) {
                                    if (!res.has(atom.id)) {
                                        res.set(atom.id, atom.get());
                                    }
                                }
                            }
                            resolve(res);
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        // INTERCEPTOR FUNCTIONS
        function addInterceptor(interceptor) {
            _log("DEBUG", "New Interceptor", interceptor);
            return INTERCEPTOR.add(interceptor);
        }
        function removeInterceptor(id) {
            INTERCEPTOR.remove(id);
        }
        // SUBSCRIBER FUNCTIONS
        function on(subscriber) {
            return SUBSCRIBER.add(subscriber);
        }
        function once(subscriber) {
            SUBSCRIBER.addOnce(subscriber);
        }
        // SERVICE FUNCTIONS
        function addService(service) {
            _log("DEBUG", "New Service", service);
            SERVICES.add(service, serviceApi(service.serviceId));
        }
        function removeService(serviceId) {
            console.log("TODO: Remove service id ", serviceId);
        }
        function getServiceState(serviceId) {
            var state = SERVICES.getServiceState(serviceId);
            // Run state through processors with getServiceState
            var eventPreProcessing = {
                from: serviceId,
                action: "getServiceState",
                data: state
            };
            var eventPostProcessing = INTERCEPTOR.run(eventPreProcessing, internalApi());
            return eventPostProcessing.data;
        }
        // ATOM FUNCTIONS
        function setAtom(atomId, value) {
            if (!ATOMS.has(atomId)) {
                ATOMS.create(atomId, value);
                _log("DEBUG", "NewAtom " + atomId);
            }
            else {
                var atom = ATOMS.get(atomId);
                atom.set(value);
            }
        }
        function getAtom(atomId, defaultValue) {
            if (!ATOMS.has(atomId) && defaultValue) {
                ATOMS.create(atomId, defaultValue);
                _log("DEBUG", "NewAtom " + atomId);
            }
            return ATOMS.get(atomId);
        }
        function hasAtom(atomId) {
            return ATOMS.has(atomId);
        }
        // STATE MACHINE FUNCTIONS
        function statusInit(states) {
            STATEMACHINE.setStates(states);
        }
        function getStatus() {
            return STATEMACHINE.get(internalApi());
        }
        function changeStatus(newStatus) {
            var oldStatus = getStatus();
            STATEMACHINE.change(newStatus, internalApi());
            if (configs.triggerEventOnStateChange === "ON") {
                var event_1 = {
                    from: "JOKI",
                    action: "STATUSUPDATE",
                    data: {
                        from: oldStatus.state,
                        to: newStatus
                    }
                };
            }
        }
        function listenMachine(fn) {
            return STATEMACHINE.listen(fn);
        }
        // INTERNAL API FUNCTIONS
        function serviceApi(serviceId) {
            return {
                api: internalApi(),
                updated: function (state) {
                    trigger({
                        from: serviceId,
                        action: "ServiceStateUpdated",
                        data: state
                    });
                },
                initialized: function (state) {
                    trigger({
                        from: serviceId,
                        action: "ServiceInitialized",
                        data: state
                    });
                },
                eventIs: {
                    statusChange: function (event) { return event.from === "JOKI" && event.action === "STATUSUPDATE"; },
                    updateFromService: function (event, serviceId) {
                        return event.from === serviceId && event.action === "ServiceStateUpdated";
                    },
                    initializationFromService: function (event, serviceId) {
                        return event.from === serviceId && event.action === "ServiceInitialized";
                    }
                }
            };
        }
        function internalApi() {
            return {
                getAtom: getAtom,
                setAtom: setAtom,
                hasAtom: hasAtom,
                serviceIds: SERVICES.list(),
                trigger: trigger,
                getState: getStatus,
                changeState: changeStatus,
                log: _log,
                getServiceState: getServiceState
            };
        }
        function config(key, value) {
            if (!key) {
                return __assign({}, configs);
            }
            if (!value) {
                if (configs[key]) {
                    return configs[key];
                }
            }
            if (configs[key]) {
                configs[key] = value;
            }
            else {
                console.warn("jokits: Unknown config key " + key + " value " + value);
            }
        }
        function _log(level, msg, additional) {
            if (configs.logger === "ON") {
                if (additional !== undefined) {
                    console.log("JOKITS:" + level + ": " + msg, additional);
                }
                else {
                    console.log("JOKITS:" + level + ": " + msg);
                }
            }
        }
        return {
            trigger: trigger,
            on: on,
            once: once,
            ask: ask,
            service: {
                add: addService,
                remove: removeService,
                getState: getServiceState
            },
            interceptor: {
                add: addInterceptor,
                remove: removeInterceptor
            },
            atom: {
                get: getAtom,
                set: setAtom,
                has: ATOMS.has
            },
            state: {
                get: getStatus,
                set: changeStatus,
                init: statusInit,
                listen: listenMachine
            },
            config: config
        };
    }

    return createJoki;

})));
