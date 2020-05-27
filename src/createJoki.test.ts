import createJoki, { JokiServiceApi, JokiInternalApi } from "./createJoki";
import { JokiEvent } from "./models/JokiInterfaces";
import { JokiAtom } from "./engineParts/atomEngine";
import { JokiState } from "./engineParts/stateEngine";
import { JokiService } from "./engineParts/serviceEngine";

describe("createJoki", () => {
    it("Simple trigger, interceptor, listener", () => {
        const joki = createJoki({});

        joki.on({
            name: "alpha",
            fn: (e: JokiEvent) => {
                expect(e.data).toBe("foo baz");
            },
        });

        joki.interceptor.add({
            to: "alpha",
            fn: (e: JokiEvent, api: JokiInternalApi) => {
                expect(e.data).toBe("Foo Bar");
                e.data = "foo baz";
                return e;
            },
        });

        joki.interceptor.add({
            to: "beta",
            fn: (e: JokiEvent) => {
                expect("This should never run").toBe(1);
                e.data = "Fuzzy";
                return e;
            },
        });

        joki.trigger({
            to: "alpha",
            data: "Foo Bar",
        });

        expect.assertions(2);
    });

    it("Once executed subsription", () => {
        const joki = createJoki({});

        const called = jest.fn();

        joki.once({
            action: "runOnce",
            fn: (ev: JokiEvent) => {
                called();
                return ev.data === "Foo";
            },
        });

        joki.trigger({
            action: "runOnce",
            data: "Bar",
        });

        joki.trigger({
            action: "runOnce",
            data: "Foo",
        });

        joki.trigger({
            action: "runOnce",
            data: "Foo",
        });

        expect(called).toBeCalledTimes(2);
    });

    it("atomEngine", () => {
        const joki = createJoki({});

        joki.atom.set<string>("test", "foo");

        const atom: JokiAtom<string> = joki.atom.get<string>("test");

        const stop = atom.subscribe((val: string) => {
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

    it("serviceEngine", () => {
        const joki = createJoki({});

        const call1 = jest.fn();
        const call2 = jest.fn();

        function testService(id: string, api: JokiServiceApi): JokiService<string> {
            let value: string = "alpha";

            function eventHandler(event: JokiEvent) {
                if (event.to === "testService") {
                    expect(event.data).toBe("foo");
                    value = event.data;
                    call1();
                }
                call2();
            }

            function getState(): string {
                return value;
            }

            return {
                eventHandler,
                getState,
            };
        }

        joki.service.add<string>({
            serviceId: "testService",
            service: testService,
        });

        expect(joki.service.getState("testService")).toBe("alpha");

        joki.trigger({
            to: "testService",
            data: "foo",
        });

        joki.trigger({
            data: "boo",
        });

        expect(joki.service.getState("testService")).toBe("foo");

        expect(call1).toBeCalledTimes(1);
        expect(call2).toBeCalledTimes(2);

        expect.assertions(5);
    });

    it("Function ask works with services and atoms", async () => {
        const joki = createJoki({});

        function testService(id: string, api: JokiServiceApi): JokiService<string> {
            let state: string = "Foo";

            function eventHandler(event: JokiEvent) {
                if (event.action === "data" && typeof event.data === "string") {
                    state = event.data;
                }
                if (event.action === "getName") {
                    return `Mr. ${state} Anderson`;
                }
            }
            return {
                eventHandler,
                getState: (): string => state,
            };
        }

        joki.atom.set("atomizer", "I am atom!");

        joki.service.add({
            service: testService,
            serviceId: "testService",
        });

        joki.service.add({
            service: testService,
            serviceId: "anotherService",
        });

        joki.trigger({
            to: "anotherService",
            action: "data",
            data: "Neo",
        });

        const res: Map<string, any> = await joki.ask({
            action: "getName",
        });

        expect(res.size).toBe(2);
        expect(res.get("testService")).toBe("Mr. Foo Anderson");
        expect(res.get("anotherService")).toBe("Mr. Neo Anderson");

        const res2: Map<string, any> = await joki.ask({
            to: "atomizer",
        });

        expect(res2.size).toBe(1);
        expect(res2.get("atomizer")).toBe("I am atom!");
    });

    it("ServiceApi", () => {
        const joki = createJoki({});

        function testService(id: string, api: JokiServiceApi): JokiService<string> {
            let state: string = "Foo";

            function eventHandler(event: JokiEvent) {
                if (event.action === "data" && typeof event.data === "string") {
                    state = event.data;
                    api.updated(state);
                }
            }
            return {
                eventHandler,
                getState: (): string => state,
            };
        }

        joki.service.add({
            serviceId: "testService",
            service: testService,
        });

        joki.on({
            from: "testService",
            fn: (e: JokiEvent) => {
                expect(e.from).toBe("testService");
                expect(e.action).toBe("ServiceStateUpdated");
                expect(e.data).toBe("Bar");
            },
        });

        joki.trigger({
            to: "testService",
            action: "data",
            data: "Bar",
        });

        expect.assertions(3);
    });

    it("StateEngine", () => {
        const joki = createJoki({});

        joki.state.init([
            {
                state: "start",
                validNext: ["alpha", "beta", "end"],
                onNext: "alpha",
                onError: "end",
            },
            {
                state: "alpha",
                validNext: ["beta", "end"],
                onNext: "beta",
                onError: "end",
            },
            {
                state: "beta",
                validNext: ["end"],
                onNext: "end",
                onError: "end",
            },
            {
                state: "end",
                validNext: ["init"],
            },
        ]);

        const li = jest.fn();
        const subCalls = jest.fn();

        const sub = joki.on({
            fn: (event: JokiEvent) => {
                expect(event.action).toBe("StateChanged");
                expect(event.from).toBe("JOKI.STATEENGINE");
                subCalls();
            },
        });

        const stop = joki.state.listen((st: JokiState) => {
            li();
        });

        const status1: JokiState = joki.state.get();
        expect(status1.state).toBe("start");

        status1.next();

        const status2: JokiState = joki.state.get();
        expect(status2.state).toBe("alpha");

        status2.error();

        const errStatus: JokiState = joki.state.get();

        expect(errStatus.state).toBe("end");

        expect(() => {
            joki.state.set("foo");
        }).toThrow();

        expect(li).toBeCalledTimes(2);
        expect(subCalls).toBeCalledTimes(2);

        stop();
    });
});
