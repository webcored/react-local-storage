declare type ReactModule = typeof import('react');
interface ReactLocalStorage<T> {
    defaults: T;
    version?: number;
    migration?: (currentValue: any, defaultValue?: T) => T | any;
}
interface LocalStorageConfig {
    storages: {
        [keyName: string]: ReactLocalStorage<any>;
    };
    storage?: Storage;
    namespace?: string;
    delimiter?: string;
    react?: ReactModule;
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
interface InitTrack {
    [keyName: string]: string[];
}
export { LocalStorageConfig, CustomDispatcher, ReactLocalStorage, Track, InitTrack, ReactModule };
