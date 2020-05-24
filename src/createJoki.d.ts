import { JokiEvent } from "./models/JokiInterfaces";
import { JokiProcessor } from "./engineParts/processorEngine";
import { JokiSubscriber } from "./engineParts/subscriberEngine";
import { Atom } from "./engineParts/atomEngine";
import { JokiServiceFactory } from "./engineParts/serviceEngine";
import { JokiMachineState, JokiState } from "./engineParts/stateEngine";
interface JokiOptions {
}
export interface JokiInstance {
    trigger: (event: JokiEvent) => void | Promise<undefined>;
    on: (listener: JokiSubscriber) => () => void;
    once: () => void;
    ask: (event: JokiEvent) => Promise<Map<string, any>>;
    service: ServiceApi;
    processor: ProcessorApi;
    atom: AtomApi;
    state: StateMachineApi;
}
export interface ServiceApi {
    add: <T>(service: JokiServiceFactory<T>) => void;
    remove: () => void;
    getState: (serviceId: string) => any;
}
export interface ProcessorApi {
    add: (processor: JokiProcessor) => string;
    remove: (id: string) => void;
}
export interface StateMachineApi {
    init: (statuses: JokiMachineState[]) => void;
    get: () => JokiState;
    set: (status: string) => void;
    listen: (fn: (state: JokiState) => void) => () => void;
}
export interface AtomApi {
    get: <T>(atomId: string) => Atom<T>;
    set: <T>(atomId: string, value: T) => void;
}
export interface JokiServiceApi {
    api: JokiInternalApi;
    updated: (state: any) => void;
}
export interface JokiInternalApi {
    get: <T>(atomId: string) => Atom<T>;
    set: <T>(atomId: string, value: T) => void;
    trigger: (event: JokiEvent) => void | (Promise<undefined>);
    getState: () => JokiState;
}
export default function createJoki(options: JokiOptions): JokiInstance;
export {};
