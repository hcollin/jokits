import { JokiEvent } from "@App/models/JokiInterfaces";
import { JokiInternalApi } from "@App/createJoki";
export interface JokiInterceptor {
    to?: string;
    from?: string;
    action?: string;
    fn: (event: JokiEvent, api: JokiInternalApi) => JokiEvent;
}
export default function interceptorEngine(): {
    add: (interceptor: JokiInterceptor) => string;
    remove: (id: string) => void;
    run: (event: JokiEvent, api: JokiInternalApi) => JokiEvent;
};
