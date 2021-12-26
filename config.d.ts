import { ReactLocalStorage, StorageConfig } from './types';
declare let config: StorageConfig;
export { config };
declare const _default: {
    storageConfig: (storageConfig: StorageConfig) => StorageConfig;
    storageKeyConfig: <T>(keyConfig: ReactLocalStorage<T>) => ReactLocalStorage<T>;
};
export default _default;
