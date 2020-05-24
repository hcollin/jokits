import { JokiInstance } from "../createJoki";

export interface JokiEvent {
    to?: string;        // Can be a name of a listener or a service Id
    from?: string;      // Who is sending this event aka Source
    action?: string;    // What action this event is supposed to execute
    broadcast?: boolean;
    data?: any;
    async?: boolean;    // IF set to true run event in async mode aka do not halt execution
}





