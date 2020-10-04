import { JokiEvent } from "@App/models/JokiInterfaces";
import idGen from "../utils/idGenerator";

export interface JokiSubscriptionInternal {
    id: string;
    once: boolean;
    name?: string; // Response TO events target this value if provided
    from?: string; // Response to values coming from this source
    action?: string; // Response to these event keys
    fn: (event: JokiEvent) => void | boolean;
}

export interface JokiSubscriber {
    name?: string; // Response TO events target this value if provided
    from?: string; // Response to values coming from this source
    action?: string; // Response to these event keys
    fn: (event: JokiEvent) => void;
}

export interface JokiSubscriberOnce {
    name?: string; // Response TO events target this value if provided
    from?: string; // Response to values coming from this source
    action?: string; // Response to these event keys
    fn: (event: JokiEvent) => boolean;
}

export default function subscriptionEngine() {
    let subscriptions: JokiSubscriptionInternal[] = [];

    function add(subscriber: JokiSubscriber) {
        const id = idGen("sub");
        const sub: JokiSubscriptionInternal = { ...subscriber, id: id, once: false };
        subscriptions.push(sub);
        return () => {
            subscriptions = subscriptions.filter((s: JokiSubscriptionInternal) => s.id !== id);
        };
    }

    function addOnce(subscriber: JokiSubscriberOnce) {
        const id = idGen("sub");
        const sub: JokiSubscriptionInternal = { ...subscriber, id: id, once: true };
        subscriptions.push(sub);
        // return () => {
        //     subscriptions = subscriptions.filter((s: JokiSubscriptionInternal) => s.id !== id);
        // };
    }
    
    function run(event: JokiEvent) {
        const subsDone: string[] = [];
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
            if (sub.name === undefined && sub.from === undefined && sub.action === undefined) execute = true;

            if (execute) {
                if (sub.once) {
                    const done: boolean | void = sub.fn(event);
                    if (done === true) {
                        subsDone.push(sub.id);
                    }
                } else {
                    sub.fn(event);
                }
            }
        });

        if (subsDone.length > 0) {
            subscriptions = subscriptions.filter((s: JokiSubscriptionInternal) => !subsDone.includes(s.id));
        }
    }

    return {
        add,
        addOnce,
        run,
    };
}
