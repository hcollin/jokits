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

interface ServiceContainer {
    id: string;
    service: JokiService<any>;
}

export interface JokiService<T> {
    eventHandler: (event: JokiEvent) => undefined|T|T[]|Map<string, T>|(Promise<T|T[]|Map<string, T>|undefined>)|void|Promise<void>;
    getState: () => T|T[]|Map<string, T>|undefined;
}

export interface ServiceCreator<T> {
    (id: string, api: JokiServiceApi, options? : any): JokiService<T>;
}

export  interface JokiServiceFactory<T> {
    serviceId: string;
    service: ServiceCreator<T>;
    options?: any
}

export default function serviceEngine(): ServiceEngine {
    
    const services: Map<string, ServiceContainer> = new Map<string, ServiceContainer>();

    function add<T>(serviceFactory: JokiServiceFactory<T>, api: JokiServiceApi) {
        
        if(services.has(serviceFactory.serviceId)) {
            throw new Error(`Service with id ${serviceFactory.serviceId} already exists`);
        }
        const service = serviceFactory.service(serviceFactory.serviceId, api, serviceFactory.options);
        const cont: ServiceContainer = {
            id: serviceFactory.serviceId,
            service: service
        };

        services.set(serviceFactory.serviceId, cont);
        
    }

    async function asyncRun(event: JokiEvent): Promise<any> {
        const res = run(event);
        return await res;

    }

    function run(event: JokiEvent): any {
        
        // Targeted event!
        if(services.has(event.to)) {
            const service = services.get(event.to);
            return service.service.eventHandler(event);
        }

        const results: Map<String, any> =  new Map<string, any>();
        services.forEach((cont: ServiceContainer) => {
            const res = cont.service.eventHandler(event);
            if(res !== undefined) {
                results.set(cont.id, res);
            }
        })
        return results;

    }

    function remove(serviceId: string) {
        if(services.has(serviceId) ) {
            services.delete(serviceId);
        }
    }

    function list(): string[] {
        const serviceArr = Array.from(services.keys());
        return serviceArr;
    }

    function has(id: string): boolean {
        return services.has(id);
    }

    function getServiceState(serviceId: string): any {
        const service = services.get(serviceId);
        if(service) {
            return service.service.getState();
        }
        return undefined;
    }

    return {
        add,
        run,
        asyncRun,
        remove,
        list,
        has,
        getServiceState,
    }
}