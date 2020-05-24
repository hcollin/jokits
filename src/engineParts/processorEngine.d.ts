import { JokiEvent } from "@App/models/JokiInterfaces";
import { JokiInternalApi } from "@App/createJoki";
export interface JokiProcessor {
    to?: string;
    from?: string;
    action?: string;
    fn: (event: JokiEvent, api: JokiInternalApi) => JokiEvent;
}
export default function processorEngine(): {
    add: (processor: JokiProcessor) => string;
    remove: (id: string) => void;
    run: (event: JokiEvent, api: JokiInternalApi) => JokiEvent;
};
