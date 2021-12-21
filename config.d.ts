import { LocalStorageConfig } from "./types";
declare let config: LocalStorageConfig;
declare const localStorageConfig: (storageConfig: LocalStorageConfig) => LocalStorageConfig;
export { localStorageConfig, config };
