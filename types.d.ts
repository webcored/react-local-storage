declare type ReactModule = typeof import('react');
interface ReactLocalStorage<T> {
    defaults: T;
    version?: number;
    migration?: (currentValue: any, defaultValue?: T) => T | any;
}
interface StorageConfig {
    storages: {
        [keyName: string]: ReactLocalStorage<any>;
    };
    storage?: Storage;
    namespace?: string;
    delimiter?: string;
    react: ReactModule | undefined;
}
interface CustomDispatcher {
    update: (data: any) => any;
    reset: () => any;
    remove: () => any;
}
interface Track {
    [keyName: string]: {
        v: number;
    };
}
interface InitializedTrack {
    [keyName: string]: string[];
}
export { StorageConfig, CustomDispatcher, ReactLocalStorage, Track, InitializedTrack, ReactModule };
