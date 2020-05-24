export interface Atom<T> {
    id: string;
    subscribe: (fn: (value: T) => void, once?: boolean) => () => void;
    set: (newValue: T) => void;
    get: () => T;
}
export interface AtomInternal<T> {
    id: string;
    value: T | undefined;
    subscribers: AtomSubscriber<T>[];
}
export interface AtomSubscriber<T> {
    id: string;
    fn: (value: T) => void;
    once?: boolean;
}
export interface AtomSubscriberContainer<T> {
    id: string;
    subscriber: AtomSubscriber<T>;
}
export interface AtomEngine {
    create: <T>(atomId: string, defaultValue: T) => boolean;
    get: <T>(atomId: string) => Atom<T>;
    remove: <T>(atomId: string) => void;
    has: (atomId: string) => boolean;
}
export default function atomEngine(): AtomEngine;
