import { JokiEvent } from "@App/models/JokiInterfaces";
import { JokiInternalApi } from "@App/createJoki";
import idGen from "../utils/idGenerator";

export interface JokiInterceptor {
    to?: string; // Events going to this target
    from?: string; // Events coming from this source
    action?: string; // Events with this action
    fn: (event: JokiEvent, api: JokiInternalApi) => JokiEvent;
}

interface JokiInterceptorInternal extends JokiInterceptor {
    _id: string;
}

export default function interceptorEngine() {
    let interceptors: JokiInterceptorInternal[] = [];

    function add(interceptor: JokiInterceptor): string {
        const id = idGen("pro");
        const pro: JokiInterceptorInternal = { ...interceptor, _id: id };
        interceptors.push(pro);
        return pro._id;
    }

    function remove(id: string) {
        interceptors = interceptors.filter((p: JokiInterceptorInternal) => p._id !== id);
    }

    function run(event: JokiEvent, api: JokiInternalApi): JokiEvent {
        const newEvent: JokiEvent = interceptors.reduce(
            (ev: JokiEvent, interceptor: JokiInterceptorInternal) => {
                let execute = false;
                if (interceptor.to && ev.to) {
                    if (interceptor.to === ev.to) {
                        execute = true;
                    } else {
                        return ev;
                    }
                }
                if (interceptor.from && ev.from) {
                    if (interceptor.from === ev.from) {
                        execute = true;
                    } else {
                        return ev;
                    }
                }
                if (interceptor.action && ev.action) {
                    if (interceptor.action === ev.action) {
                        execute = true;
                    } else {
                        return ev;
                    }
                }
                if (interceptor.to === undefined && interceptor.from === undefined && interceptor.action === undefined) execute = true;

                api.log("DEBUG", `Interceptor:Run : E${execute}`, [interceptor, event]);
                if (execute) {
                    return interceptor.fn(ev, api);
                }

                return ev;
            },
            { ...event }
        );
        return Object.freeze(newEvent);
    }

    return {
        add,
        remove,
        run,
    };
}
