import { CustomDispatcher, ReactLocalStorage } from './types';
declare const storageConfig: (storageConfig: import("./types").StorageConfig) => import("./types").StorageConfig, storageKeyConfig: <T>(keyConfig: ReactLocalStorage<T>) => ReactLocalStorage<T>;
declare const useLocalStorage: <T>(key: string) => [T, CustomDispatcher];
export { useLocalStorage, storageConfig, storageKeyConfig, ReactLocalStorage };
