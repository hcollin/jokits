import { JokiEvent } from "@App/models/JokiInterfaces";
import idGen from "../utils/idGenerator";

export interface JokiSubscriptionInternal {
    id: string;
    name?: string;           // Response TO events target this value if provided
    from?: string;           // Response to values coming from this source
    action?: string;         // Response to these event keys
    fn: (event: JokiEvent) => void;
}

export interface JokiSubscriber {
    name?: string;           // Response TO events target this value if provided
    from?: string;           // Response to values coming from this source
    action?: string;         // Response to these event keys
    fn: (event: JokiEvent) => void;
}

export default function subscriptionEngine() {
    
    let subscriptions: JokiSubscriptionInternal[] = [];
    
    function add(subscriber: JokiSubscriber) {
        const id = idGen("sub");
        const sub: JokiSubscriptionInternal = {...subscriber, id: id};
        subscriptions.push(sub);
        return () => {
            subscriptions = subscriptions.filter((s: JokiSubscriptionInternal) => s.id !== id);
        }
    }

    function run(event: JokiEvent) {
        subscriptions.forEach((sub: JokiSubscriptionInternal) => {
            let execute = false;

            if (sub.name && event.to) {
                if (sub.name === event.to) {
                    execute = true;
                } else {
                    return;
                }
            }

            if (sub.from && event.from) {
                if (sub.from === event.from) {
                    execute = true;
                } else {
                    return;
                }
            }

            if (sub.action && event.action) {
                if (sub.action === event.action) {
                    execute = true;
                } else {
                    return;
                }
            }

            // If no limiting parameters are given, trigger on all
            if(sub.name === undefined && sub.from === undefined && sub.action === undefined) execute = true;

            if(execute) {
                sub.fn(event);
            }
            
        });
    }

    return {
        add,
        run
    }

}