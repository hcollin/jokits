import { JokiInternalApi } from "@App/createJoki";
import idGen from "../utils/idGenerator";

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

interface JokiMachineStateListener {
    id: string;
    fn: (status: JokiState) => void;
}

export default function stateEngine() {
    let currentState: string = "";

    const statusListeners: Map<string, JokiMachineStateListener> = new Map<string, JokiMachineStateListener>();
    const configuredStates: Map<string, JokiMachineState> = new Map<string, JokiMachineState>();

    function setStates(newStates: JokiMachineState[]) {
        if (newStates.length === 0) {
            throw new Error(`Cannot initialize Joki State Engine with 0 states`);
        }
        newStates.forEach((st: JokiMachineState) => {
            configuredStates.set(st.state, st);
            if (st.initial === true) {
                currentState = st.state;
            }
        });

        if (currentState === "") {
            currentState = newStates[0].state;
        }
    }

    function get(api: JokiInternalApi): JokiState {
        return createJokiStateFrom(currentState, api);
    }

    function createJokiStateFrom(state: string, api: JokiInternalApi) {
        const rule = configuredStates.get(state);
        const js: JokiState = {
            state: rule.state,
            validNext: rule.validNext,
        };
        if (rule.onNext) {
            js.next = () => {
                change(rule.onNext, api);
            };
        }

        if (rule.onError) {
            js.error = () => {
                change(rule.onError, api);
            };
        }

        return js;
    }

    function change(newState: string, api: JokiInternalApi) {
        const currentRule = configuredStates.get(currentState);
        if(!currentRule.validNext.includes(newState)) {
            throw new Error(`${newState} is not a valid state to move forward from ${currentState}. Valid options are: ${currentRule.validNext.join(", ")}`)
        }
        const newRule = configuredStates.get(newState);
        if (newRule) {
            currentState = newRule.state;
            
            const newJokiState: JokiState = createJokiStateFrom(newRule.state, api);
            statusListeners.forEach((listener: JokiMachineStateListener) => {
                listener.fn(newJokiState);
            });
            
            api.trigger({
                from: "JOKI.STATEENGINE",
                action: "StateChanged",
                data: currentState,
            });


        }
    }

    function listen(fn: (status: JokiState) => void): () => void {
        const li: JokiMachineStateListener = {
            id: idGen(),
            fn: fn
        };
        statusListeners.set(li.id, li);
        return () => {
            statusListeners.delete(li.id);
        }
    }

    return {
        get,
        setStates,
        change,
        listen
    };
}
