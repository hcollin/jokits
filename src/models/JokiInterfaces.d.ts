export interface JokiEvent {
    to?: string;
    from?: string;
    action?: string;
    broadcast?: boolean;
    data?: any;
    async?: boolean;
}
