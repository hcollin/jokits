import { JokiEvent } from "./models/JokiInterfaces";
import { JokiInterceptor } from "./engineParts/interceptorEngine";
import { JokiSubscriber, JokiSubscriberOnce } from "./engineParts/subscriberEngine";
import { JokiAtom } from "./engineParts/atomEngine";
import { JokiServiceFactory } from "./engineParts/serviceEngine";
import { JokiMachineState, JokiState } from "./engineParts/stateEngine";
export interface JokiOptions {
}
export interface JokiInstance {
    trigger: (event: JokiEvent) => void | Promise<undefined>;
    on: (listener: JokiSubscriber) => () => void;
    once: (listener: JokiSubscriberOnce) => void;
    ask: (event: JokiEvent) => Promise<Map<string, any>>;
    service: ServiceApi;
    interceptor: InterceptorApi;
    atom: AtomApi;
    state: StateMachineApi;
    config: (key?: string, value?: string) => any;
}
export interface JokiConfigs {
    logger: string;
    triggerEventOnStateChange: string;
}
export interface ServiceApi {
    add: <T>(service: JokiServiceFactory<T>) => void;
    remove: (serviceId: string) => void;
    getState: (serviceId: string) => any;
}
export interface InterceptorApi {
    add: (interceptor: JokiInterceptor) => string;
    remove: (id: string) => void;
}
export interface StateMachineApi {
    init: (statuses: JokiMachineState[]) => void;
    get: () => JokiState;
    set: (status: string) => void;
    listen: (fn: (state: JokiState) => void) => () => void;
}
export interface AtomApi {
    get: <T>(atomId: string) => JokiAtom<T>;
    set: <T>(atomId: string, value: T) => void;
    has: (atomId: string) => boolean;
}
export interface JokiServiceApi {
    api: JokiInternalApi;
    updated: (state: any) => void;
    initialized: (state: any) => void;
    eventIs: JokiEventDefaultEventListeners;
}
export interface JokiEventDefaultEventListeners {
    statusChange: (event: JokiEvent) => boolean;
    updateFromService: (event: JokiEvent, serviceId: string) => boolean;
    initializationFromService: (event: JokiEvent, serviceId: string) => boolean;
}
export interface JokiInternalApi {
    getAtom: <T>(atomId: string) => JokiAtom<T>;
    setAtom: <T>(atomId: string, value: T) => void;
    hasAtom: (atomId: string) => boolean;
    serviceIds: string[];
    trigger: (event: JokiEvent) => void | Promise<undefined>;
    getState: () => JokiState;
    changeState: (value: string) => void;
    log: (level: "DEBUG" | "WARN" | "ERROR", msg: string, additional?: any) => void;
    getServiceState: <T>(serviceId: string) => T | undefined;
}
export default function createJoki(options: JokiOptions): JokiInstance;
