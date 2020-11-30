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
var JokiServiceStatus;
(function (JokiServiceStatus) {
    JokiServiceStatus["UNKNOWN"] = "Unknown";
    JokiServiceStatus["CLOSED"] = "Closed";
    JokiServiceStatus["READY"] = "Ready";
    JokiServiceStatus["PROCESSING"] = "Processing";
    JokiServiceStatus["ERROR"] = "Error";
})(JokiServiceStatus = exports.JokiServiceStatus || (exports.JokiServiceStatus = {}));
;
function serviceEngine() {
    var services = new Map();
    function add(serviceFactory, api) {
        if (services.has(serviceFactory.serviceId)) {
            throw new Error("Service with id " + serviceFactory.serviceId + " already exists");
        }
        var service = serviceFactory.service(serviceFactory.serviceId, api, serviceFactory.options);
        var cont = {
            id: serviceFactory.serviceId,
            service: service,
            status: serviceFactory.initStatus || JokiServiceStatus.UNKNOWN
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
            return service.service.eventHandler(event, null);
        }
        var results = new Map();
        services.forEach(function (cont) {
            var res = cont.service.eventHandler(event, null);
            if (res !== undefined) {
                results.set(cont.id, res);
            }
        });
        return results;
    }
    function asyncWork(event, worker) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        res = work(event, worker);
                        return [4 /*yield*/, res];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    function work(event, worker) {
        // Targeted event!
        if (services.has(event.to)) {
            var service = services.get(event.to);
            return service.service.eventHandler(event, worker);
        }
        var results = new Map();
        services.forEach(function (cont) {
            var res = cont.service.eventHandler(event, worker);
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
    function getServiceStatus(serviceId) {
        var service = services.get(serviceId);
        if (service) {
            return service.status;
        }
        return JokiServiceStatus.UNKNOWN;
    }
    function setServiceStatus(serviceId, newStatus) {
        var service = services.get(serviceId);
        if (service) {
            service.status = newStatus;
            services.set(serviceId, service);
        }
        else {
            throw new Error("Cannot set status " + newStatus + " for an unknown service " + serviceId);
        }
    }
    return {
        add: add,
        run: run,
        work: work,
        asyncRun: asyncRun,
        asyncWork: asyncWork,
        remove: remove,
        list: list,
        has: has,
        getServiceState: getServiceState,
        getServiceStatus: getServiceStatus,
        setServiceStatus: setServiceStatus
    };
}
exports["default"] = serviceEngine;
