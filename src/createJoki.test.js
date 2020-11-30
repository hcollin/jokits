"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
exports.__esModule = true;
var createJoki_1 = require("./createJoki");
var serviceEngine_1 = require("./engineParts/serviceEngine");
describe("createJoki", function () {
    it("Simple trigger, interceptor, listener", function () {
        var joki = createJoki_1["default"]({});
        joki.on({
            name: "alpha",
            fn: function (e) {
                expect(e.data).toBe("foo baz");
            }
        });
        joki.interceptor.add({
            to: "alpha",
            fn: function (e, api) {
                expect(e.data).toBe("Foo Bar");
                e.data = "foo baz";
                return e;
            }
        });
        joki.interceptor.add({
            to: "beta",
            fn: function (e) {
                expect("This should never run").toBe(1);
                e.data = "Fuzzy";
                return e;
            }
        });
        joki.trigger({
            to: "alpha",
            data: "Foo Bar"
        });
        expect.assertions(2);
    });
    it("Once executed subsription", function () {
        var joki = createJoki_1["default"]({});
        var called = jest.fn();
        joki.once({
            action: "runOnce",
            fn: function (ev) {
                called();
                return ev.data === "Foo";
            }
        });
        joki.trigger({
            action: "runOnce",
            data: "Bar"
        });
        joki.trigger({
            action: "runOnce",
            data: "Foo"
        });
        joki.trigger({
            action: "runOnce",
            data: "Foo"
        });
        expect(called).toBeCalledTimes(2);
    });
    it("atomEngine", function () {
        var joki = createJoki_1["default"]({});
        joki.atom.set("test", "foo");
        var atom = joki.atom.get("test");
        var stop = atom.subscribe(function (val) {
            expect(val).toBe("bar");
        });
        expect(atom.get()).toBe("foo");
        atom.set("bar");
        expect(atom.get()).toBe("bar");
        // Stop subscriber
        stop();
        atom.set("goo");
        expect(atom.get()).toBe("goo");
        expect.assertions(4);
    });
    it("serviceEngine", function () {
        var joki = createJoki_1["default"]({});
        var call1 = jest.fn();
        var call2 = jest.fn();
        function testService(id, api) {
            var value = "alpha";
            function eventHandler(event) {
                if (event.to === "testService") {
                    expect(event.data).toBe("foo");
                    value = event.data;
                    call1();
                }
                call2();
            }
            function getState() {
                return value;
            }
            return {
                eventHandler: eventHandler,
                getState: getState
            };
        }
        joki.service.add({
            serviceId: "testService",
            service: testService
        });
        expect(joki.service.getState("testService")).toBe("alpha");
        joki.trigger({
            to: "testService",
            data: "foo"
        });
        joki.trigger({
            data: "boo"
        });
        expect(joki.service.getState("testService")).toBe("foo");
        expect(call1).toBeCalledTimes(1);
        expect(call2).toBeCalledTimes(2);
        expect.assertions(5);
    });
    it("Service Status functionality", function () {
        var joki = createJoki_1["default"]({});
        var call1 = jest.fn();
        function testService(sid, api) {
            var value = "alpha";
            function eventHandler(event) {
                if (event.to === sid) {
                    if (event.action === "ready") {
                        api.changeStatus(serviceEngine_1.JokiServiceStatus.READY);
                    }
                    if (event.action === "doing") {
                        api.changeStatus(serviceEngine_1.JokiServiceStatus.PROCESSING);
                    }
                    if (event.action === "amReady") {
                        amReady();
                    }
                    if (event.action === "otherReady") {
                        youReady(event.data);
                    }
                }
            }
            function amReady() {
                if (api.status() !== serviceEngine_1.JokiServiceStatus.READY) {
                    throw new Error("This service " + sid + " is not ready");
                }
                return true;
            }
            function youReady(t) {
                if (api.status(t) !== serviceEngine_1.JokiServiceStatus.READY) {
                    throw new Error("Service " + t + " is not ready");
                }
            }
            function getState() {
                return value;
            }
            return {
                eventHandler: eventHandler,
                getState: getState
            };
        }
        joki.service.add({
            serviceId: "TestServiceOne",
            service: testService
        });
        joki.service.add({
            serviceId: "TestServiceTwo",
            service: testService,
            initStatus: serviceEngine_1.JokiServiceStatus.CLOSED
        });
        expect(joki.service.getStatus("TestServiceOne")).toBe(serviceEngine_1.JokiServiceStatus.UNKNOWN);
        expect(joki.service.getStatus("TestServiceTwo")).toBe(serviceEngine_1.JokiServiceStatus.CLOSED);
        joki.trigger({
            to: "TestServiceOne",
            action: "ready"
        });
        expect(joki.service.getStatus("TestServiceOne")).toBe(serviceEngine_1.JokiServiceStatus.READY);
        joki.trigger({
            to: "TestServiceOne",
            action: "amReady"
        });
        joki.trigger({
            to: "TestServiceTwo",
            action: "otherReady",
            data: "TestServiceOne"
        });
        joki.on({
            from: "TestServiceTwo",
            action: createJoki_1.JokiServiceEvent.StatusUpdate,
            fn: function (e) {
                call1();
            }
        });
        joki.trigger({
            to: "TestServiceTwo",
            action: "ready"
        });
        joki.trigger({
            to: "TestServiceTwo",
            action: "doing"
        });
        joki.trigger({
            to: "TestServiceOne",
            action: "doing"
        });
        expect(call1).toBeCalledTimes(2);
    });
    it("Service work", function () {
        var joki = createJoki_1["default"]({});
        var call1 = jest.fn();
        function testService(sid, api) {
            var value = "alpha";
            function eventHandler(event, worker) {
                if (event.to === sid) {
                    if (event.action === "change") {
                        value = event.data;
                        api.updated(value);
                    }
                    if (event.action === "upper") {
                        value = value.toUpperCase();
                        api.updated(value);
                        worker(value);
                    }
                }
            }
            function getState() {
                return value;
            }
            return {
                eventHandler: eventHandler,
                getState: getState
            };
        }
        joki.service.add({
            serviceId: "S1",
            service: testService,
            initStatus: serviceEngine_1.JokiServiceStatus.READY
        });
        joki.work({
            to: "S1",
            action: "upper"
        }, function (value) {
            expect(value).toBe("ALPHA");
            call1();
        });
        expect(call1).toBeCalledTimes(1);
    });
    it("Function ask works with services and atoms", function () { return __awaiter(void 0, void 0, void 0, function () {
        function testService(id, api) {
            var state = "Foo";
            function eventHandler(event) {
                if (event.action === "data" && typeof event.data === "string") {
                    state = event.data;
                }
                if (event.action === "getName") {
                    return "Mr. " + state + " Anderson";
                }
            }
            return {
                eventHandler: eventHandler,
                getState: function () { return state; }
            };
        }
        var joki, res, res2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    joki = createJoki_1["default"]({});
                    joki.atom.set("atomizer", "I am atom!");
                    joki.service.add({
                        service: testService,
                        serviceId: "testService"
                    });
                    joki.service.add({
                        service: testService,
                        serviceId: "anotherService"
                    });
                    joki.trigger({
                        to: "anotherService",
                        action: "data",
                        data: "Neo"
                    });
                    return [4 /*yield*/, joki.ask({
                            action: "getName"
                        })];
                case 1:
                    res = _a.sent();
                    expect(res.size).toBe(2);
                    expect(res.get("testService")).toBe("Mr. Foo Anderson");
                    expect(res.get("anotherService")).toBe("Mr. Neo Anderson");
                    return [4 /*yield*/, joki.ask({
                            to: "atomizer"
                        })];
                case 2:
                    res2 = _a.sent();
                    expect(res2.size).toBe(1);
                    expect(res2.get("atomizer")).toBe("I am atom!");
                    return [2 /*return*/];
            }
        });
    }); });
    it("ServiceApi", function () {
        var joki = createJoki_1["default"]({});
        function testService(id, api) {
            var state = "Foo";
            function eventHandler(event) {
                if (event.action === "data" && typeof event.data === "string") {
                    state = event.data;
                    api.updated(state);
                }
            }
            return {
                eventHandler: eventHandler,
                getState: function () { return state; }
            };
        }
        joki.service.add({
            serviceId: "testService",
            service: testService
        });
        joki.on({
            from: "testService",
            fn: function (e) {
                expect(e.from).toBe("testService");
                expect(e.action).toBe("ServiceStateUpdated");
                expect(e.data).toBe("Bar");
            }
        });
        joki.trigger({
            to: "testService",
            action: "data",
            data: "Bar"
        });
        expect.assertions(3);
    });
    it("StateEngine", function () {
        var joki = createJoki_1["default"]({});
        joki.state.init([
            {
                state: "start",
                validNext: ["alpha", "beta", "end"],
                onNext: "alpha",
                onError: "end"
            },
            {
                state: "alpha",
                validNext: ["beta", "end"],
                onNext: "beta",
                onError: "end"
            },
            {
                state: "beta",
                validNext: ["end"],
                onNext: "end",
                onError: "end"
            },
            {
                state: "end",
                validNext: ["init"]
            },
        ]);
        var li = jest.fn();
        var subCalls = jest.fn();
        var sub = joki.on({
            fn: function (event) {
                expect(event.action).toBe("StateChanged");
                expect(event.from).toBe("JOKI.STATEENGINE");
                subCalls();
            }
        });
        var stop = joki.state.listen(function (st) {
            li();
        });
        var status1 = joki.state.get();
        expect(status1.state).toBe("start");
        status1.next();
        var status2 = joki.state.get();
        expect(status2.state).toBe("alpha");
        status2.error();
        var errStatus = joki.state.get();
        expect(errStatus.state).toBe("end");
        expect(function () {
            joki.state.set("foo");
        }).toThrow();
        expect(li).toBeCalledTimes(2);
        expect(subCalls).toBeCalledTimes(2);
        stop();
    });
});
