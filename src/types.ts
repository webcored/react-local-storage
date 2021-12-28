declare type ReactModule = typeof import('react');

interface ReactLocalStorage<T> {
  defaults: T;
  version?: number;
  migration?: (currentValue: any, defaultValue?: T) => T | any;
}

interface StorageConfig {
  storages: {
    [keyName: string]: ReactLocalStorage<any>,
  },
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

interface StorageTrack {
  [keyName: string]: string[];
}

interface VersionTrack {
  [keyName: string]: {
    v: number;
  }
}

export {
  StorageConfig,
  CustomDispatcher,
  ReactLocalStorage,
  StorageTrack,
  VersionTrack,
  ReactModule
}
