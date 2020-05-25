import { JokiEvent } from "./models/JokiInterfaces";
import interceptorEngine, { JokiInterceptor } from "./engineParts/interceptorEngine";
import subscriptionEngine, { JokiSubscriber } from "./engineParts/subscriberEngine";
import atomEngine, { JokiAtom } from "./engineParts/atomEngine";
import serviceEngine, { JokiServiceFactory } from "./engineParts/serviceEngine";
import stateEngine, { JokiMachineState, JokiState } from "./engineParts/stateEngine";

export interface JokiOptions {}

export interface JokiInstance {
    // Main functions
    trigger: (event: JokiEvent) => void|Promise<undefined>; // Fire and forget an event
    on: (listener: JokiSubscriber) => () => void;
    once: () => void;
    ask: (event: JokiEvent) => Promise<Map<string, any>>;
    
    service: ServiceApi;
    interceptor: InterceptorApi;
    atom: AtomApi;
    state: StateMachineApi;
    
    config: (key: string, value: string) => void;
}

export interface JokiConfigs {
    logger: string; // OFF|ON
}

export interface ServiceApi {
    add: <T>(service: JokiServiceFactory<T>) => void;
    remove: (serviceId: string) => void;
    getState: (serviceId: string) => any; // Get the current state of a service
}

export interface InterceptorApi {
    add:(interceptor: JokiInterceptor) => string;
    remove: (id: string) => void;
}

export interface StateMachineApi {
    init: (statuses: JokiMachineState[]) => void;
    get: () => JokiState;
    set:(status: string) => void;
    listen: (fn: (state: JokiState) => void) => () => void;
}

export interface AtomApi {
    get: <T>(atomId: string) => JokiAtom<T>;
    set: <T>(atomId: string, value: T) => void;
    has: (atomId: string) => boolean;
}

export interface JokiServiceApi {
    // update: () => void;     // Service state has updated, info others
    // ask: () => void;        // Ask for the state of another service
    api: JokiInternalApi;
    updated: (state: any) => void;


}

export interface JokiInternalApi {
    get: <T>(atomId: string) => JokiAtom<T>; // Get Atom
    set: <T>(atomId: string, value: T) => void; // Create Atom and/or Set value for atom
    trigger: (event: JokiEvent) => void|(Promise<undefined>);
    getState: () => JokiState;
    log: (level: "DEBUG"|"WARN"|"ERROR", msg: string, additional?: any) => void;
}

export default function createJoki(options: JokiOptions): JokiInstance {


    const configs: JokiConfigs = {
        logger: "OFF"
    };

    const INTERCEPTOR = interceptorEngine();
    const SUBSCRIBER = subscriptionEngine();
    const ATOMS = atomEngine();
    const SERVICES = serviceEngine();
    const STATEMACHINE = stateEngine();

    // MAIN FUNCTIONS

    function trigger(event: JokiEvent): void|Promise<undefined> {
        _log("DEBUG", `TriggerEvent`, event);
        if(event.async === true)  {
            return new Promise(async (resolve, reject) => {
                const ev: JokiEvent = await INTERCEPTOR.run(Object.freeze(event), internalApi());
                await SUBSCRIBER.run(ev);
                await SERVICES.run(ev);
                resolve();
                
            
            });
        } else {
            const ev: JokiEvent = INTERCEPTOR.run(Object.freeze(event), internalApi());
            SUBSCRIBER.run(ev);
            SERVICES.run(ev);
        }
    }

    function ask(event: JokiEvent): Promise<Map<string, any>> {

        return new Promise( async (resolve, reject) => {
            const ev: JokiEvent = await INTERCEPTOR.run(Object.freeze(event), internalApi());
            const res: Map<string, any> = await SERVICES.run(ev);
            if(ev.to !== undefined) {
                const atom = ATOMS.get(ev.to);
                if(atom) {
                    if(!res.has(atom.id)) {
                        res.set(atom.id, atom.get());
                    }
                }

            }
            resolve(res);
        });
    }

    
    // INTERCEPTOR FUNCTIONS

    function addInterceptor(interceptor: JokiInterceptor): string {
        _log("DEBUG", `New Interceptor`, interceptor);
        return INTERCEPTOR.add(interceptor);
    }

    function removeInterceptor(id: string) {
        INTERCEPTOR.remove(id);
    }

    // SUBSCRIBER FUNCTIONS

    function on(subscriber: JokiSubscriber) {
        return SUBSCRIBER.add(subscriber);
    }

    function once() {}

    // SERVICE FUNCTIONS

    function addService<T>(service: JokiServiceFactory<T>) {
        _log("DEBUG", `New Service`, service);
        SERVICES.add<T>(service, serviceApi(service.serviceId));
    }

    function removeService(serviceId: string) {
        console.log("TODO: Remove service id ", serviceId);
    }

    function getServiceState(serviceId: string): any {
        const state = SERVICES.getServiceState(serviceId);
        // Run state through processors with getServiceState
        const eventPreProcessing: JokiEvent = {
            from: serviceId,
            action: "getServiceState",
            data: state,
        };

        const eventPostProcessing: JokiEvent = INTERCEPTOR.run(eventPreProcessing, internalApi());
        return eventPostProcessing.data;
    }

    // ATOM FUNCTIONS
    function setAtom<T>(atomId: string, value: T | undefined) {
        if (!ATOMS.has(atomId)) {
            ATOMS.create<T>(atomId, value);
            _log("DEBUG", `NewAtom ${atomId}`);
        } else {
            const atom = ATOMS.get<T>(atomId);
            atom.set(value);
        }
    }

    function getAtom<T>(atomId: string): JokiAtom<T> | undefined {
        return ATOMS.get(atomId);
    }

    // STATE MACHINE FUNCTIONS

    function statusInit(states: JokiMachineState[]) {
        STATEMACHINE.setStates(states);
    }

    function getStatus(): JokiState {
        return STATEMACHINE.get(internalApi());
    }

    function changeStatus(newStatus: string): void {
        STATEMACHINE.change(newStatus, internalApi());
    }

    function listenMachine(fn: (value: JokiState) => void): () => void {
        return STATEMACHINE.listen(fn);
    }

    // INTERNAL API FUNCTIONS

    function serviceApi(serviceId: string): JokiServiceApi {
        return {
            api: internalApi(),
            updated: (state: any) => {
                trigger({
                    from: serviceId,
                    action: "ServiceStateUpdated",
                    data: state
                });
            }

        };
    }

    function internalApi(): JokiInternalApi {
        return {
            get: getAtom,
            set: setAtom,
            trigger,
            getState: getStatus,
            log: _log,
        };
    }

    function config(key: keyof JokiConfigs, value: string) {
        if(configs[key]) {
            configs[key] = value;
        }
    }

    function _log(level: "DEBUG"|"WARN"|"ERROR", msg: string, additional?: any) {
        if(configs.logger ==="ON") {
            if(additional !== undefined) {
                console.log(`JOKITS:${level}: ${msg}`, additional);
            } else {
                console.log(`JOKITS:${level}: ${msg}`);
            }
        }
    }

    return {
        trigger,
        on,
        once,
        ask,

        service: {
            add: addService,
            remove: removeService,
            getState: getServiceState,
        },

        interceptor: {
            add: addInterceptor,
            remove: removeInterceptor,
        },

        atom: {
            get: getAtom,
            set: setAtom,
            has: ATOMS.has,
        },

        state:{
            get: getStatus,
            set: changeStatus,
            init: statusInit,
            listen: listenMachine,
        },

        config
    };
}
