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
export default function atomEngine(): AtomEngine {
    const atoms: Map<string, AtomInternal<any>> = new Map<string, AtomInternal<any>>();

    let atomSubId = 0;

    function subscribeToAtom<T>(a: AtomInternal<T>, fn: (value: T) => void, once: boolean): () => void {
        const id = `atomSub-${atomSubId++}`;
        const atomCont: AtomSubscriber<T> = {
            id: id,
            fn: fn,
            once: once
        };
        a.subscribers.push(atomCont);
        return () => {
            a.subscribers = a.subscribers.filter((s: AtomSubscriber<any>) => s.id !== id);
        };
    }

    function updateAtomValue<T>(at: AtomInternal<T>, value: T): void {
        at.value = value;
        at.subscribers.forEach((sub: AtomSubscriber<T>) => {
            sub.fn(value);
        });
    }

    function createAtomFromInteral<T>(atomInt: AtomInternal<T>): Atom<T> {
        const atom: Atom<T> = {
            id: atomInt.id,
            subscribe: (fn: (value: T) => void, once=false) => {
                return subscribeToAtom(atomInt, fn, once);
            },
            set: (value: T) => {
                updateAtomValue<T>(atomInt, value);
            },
            get: () => {
                return atomInt.value;
            },
        };

        return atom;
    }

    function create<T>(atomId: string, defaultValue: T | undefined): boolean {
        const atomInt: AtomInternal<T> = {
            id: atomId,
            value: defaultValue,
            subscribers: [],
        };
        if (atoms.has(atomId)) {
            return false;
        }
        atoms.set(atomId, atomInt);
        return true;
    }

    function get<T>(atomId: string): Atom<T> | undefined {
        const atomInt: AtomInternal<T> = atoms.get(atomId);
        if (!atomInt) {
            return undefined;
        }
        return createAtomFromInteral<T>(atomInt);
    }

    function remove<T>(atomId: string): void {
        const at: AtomInternal<T> = atoms.get(atomId);
        if (at) {
            updateAtomValue(at, undefined);
            atoms.delete(atomId);
        }
        return;
    }

    function has(atomId: string): boolean {
        return atoms.has(atomId);
    }

    

    return {
        create,
        get,
        remove,
        has
    };
}
