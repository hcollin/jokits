import { JokiEvent } from "@App/models/JokiInterfaces";
import { JokiInternalApi } from "@App/createJoki";
import idGen from "../utils/idGenerator";

export interface JokiProcessor {
    to?: string; // Events going to this target
    from?: string; // Events coming from this source
    action?: string; // Events with this action
    fn: (event: JokiEvent, api: JokiInternalApi) => JokiEvent;
}

interface JokiProcessorInternal extends JokiProcessor {
    _id: string;
}

export default function processorEngine() {
    let processors: JokiProcessorInternal[] = [];

    function add(processor: JokiProcessor): string {
        const id = idGen("pro");
        const pro: JokiProcessorInternal = { ...processor, _id: id };
        processors.push(pro);
        return pro._id;
    }

    function remove(id: string) {
        processors = processors.filter((p: JokiProcessorInternal) => p._id !== id);
    }

    function run(event: JokiEvent, api: JokiInternalApi): JokiEvent {
        const newEvent: JokiEvent = processors.reduce(
            (ev: JokiEvent, pro: JokiProcessorInternal) => {
                let execute = false;
                if (pro.to && ev.to) {
                    if (pro.to === ev.to) {
                        execute = true;
                    } else {
                        return ev;
                    }
                }
                if (pro.from && ev.from) {
                    if (pro.from === ev.from) {
                        execute = true;
                    } else {
                        return ev;
                    }
                }
                if (pro.action && ev.action) {
                    if (pro.action === ev.action) {
                        execute = true;
                    } else {
                        return ev;
                    }
                }
                if (pro.to === undefined && pro.from === undefined && pro.action === undefined) execute = true;

                api.log("DEBUG", `Processor:Run : E${execute}`, [pro, event]);
                if (execute) {
                    return pro.fn(ev, api);
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
