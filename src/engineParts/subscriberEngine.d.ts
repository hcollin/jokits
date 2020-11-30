import { JokiEvent } from "@App/models/JokiInterfaces";
export interface JokiSubscriptionInternal {
    id: string;
    once: boolean;
    name?: string;
    from?: string;
    action?: string;
    fn: (event: JokiEvent) => void | boolean;
}
export interface JokiSubscriber {
    name?: string;
    from?: string;
    action?: string;
    fn: (event: JokiEvent) => void;
}
export interface JokiSubscriberOnce {
    name?: string;
    from?: string;
    action?: string;
    fn: (event: JokiEvent) => boolean;
}
export default function subscriptionEngine(): {
    add: (subscriber: JokiSubscriber) => () => void;
    addOnce: (subscriber: JokiSubscriberOnce) => void;
    run: (event: JokiEvent) => void;
};
