"use strict";
exports.__esModule = true;
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
exports["default"] = atomEngine;
