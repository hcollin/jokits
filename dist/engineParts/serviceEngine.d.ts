import { JokiServiceApi } from "@App/createJoki";
import { JokiEvent } from "@App/models/JokiInterfaces";
export interface ServiceEngine {
    add: <T>(serviceFactory: JokiServiceFactory<T>, api: JokiServiceApi) => void;
    run: (event: JokiEvent) => any;
    asyncRun: (event: JokiEvent) => Promise<any>;
    remove: (serviceId: string) => void;
    list: () => string[];
    has: (serviceId: string) => boolean;
    getServiceState: (serviceId: string) => any;
}
export interface JokiService<T> {
    eventHandler: (event: JokiEvent) => undefined | T | T[] | Map<string, T> | (Promise<T | T[] | Map<string, T> | undefined>) | void | Promise<void>;
    getState: () => T | T[] | Map<string, T> | undefined;
}
export interface ServiceCreator<T> {
    (id: string, api: JokiServiceApi, options?: any): JokiService<T>;
}
export interface JokiServiceFactory<T> {
    serviceId: string;
    service: ServiceCreator<T>;
    options?: any;
}
export default function serviceEngine(): ServiceEngine;
