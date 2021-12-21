import { CustomDispatcher, ReactLocalStorage } from './types';
declare const useLocalStorage: <T>(key: string) => [T, CustomDispatcher];
export { useLocalStorage, ReactLocalStorage };
