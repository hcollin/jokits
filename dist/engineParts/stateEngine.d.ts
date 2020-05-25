import { JokiInternalApi } from "@App/createJoki";
export interface StateEngine {
    get: (api: JokiInternalApi) => JokiState;
    setStates: (states: JokiMachineState[]) => void;
    change: (newState: string, api: JokiInternalApi) => void;
    listen: (fn: (state: JokiState) => void) => () => void;
}
export interface JokiState {
    state: string;
    validNext: string[];
    next?: () => void;
    error?: () => void;
}
export interface JokiMachineState {
    state: string;
    validNext: string[];
    onNext?: string;
    onError?: string;
    initial?: boolean;
}
export default function stateEngine(): {
    get: (api: JokiInternalApi) => JokiState;
    setStates: (newStates: JokiMachineState[]) => void;
    change: (newState: string, api: JokiInternalApi) => void;
    listen: (fn: (status: JokiState) => void) => () => void;
};
