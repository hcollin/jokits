import { JokiEvent } from "@App/models/JokiInterfaces";
export interface JokiSubscriptionInternal {
    id: string;
    name?: string;
    from?: string;
    action?: string;
    fn: (event: JokiEvent) => void;
}
export interface JokiSubscriber {
    name?: string;
    from?: string;
    action?: string;
    fn: (event: JokiEvent) => void;
}
export default function subscriptionEngine(): {
    add: (subscriber: JokiSubscriber) => () => void;
    run: (event: JokiEvent) => void;
};
