"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalStorage = void 0;
const config_1 = require("./config");
const react = () => {
    if (!config_1.config.react) {
        throw new Error('Please provide the react instance');
    }
    return config_1.config.react;
};
const storage = () => config_1.config.storage || window.localStorage;
const initialized = {};
let track;
const defaultTrackVersion = 1;
class ReactLocalStorageKlass {
    constructor(key) {
        this.key = key;
        this.updateState = null;
        this.storageConfig = { defaults: {} };
    }
    init() {
        const { storages } = config_1.config;
        const storageConfig = storages[this.key];
        if (!storageConfig) {
            console.warn(`config definition for storage:${this.key} not found`);
        }
        this.storageConfig = storageConfig;
        const keyName = this.getKeyName(this.key);
        let stateValue;
        const initKey = this.getKeyName('init');
        if (!initialized[initKey]) {
            initialized[initKey] = [];
        }
        const data = storage().getItem(keyName);
        if (!data && !initialized[initKey].includes(this.key) && (storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.defaults)) {
            this.save(keyName, storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.defaults);
            this.setTrack(this.key, storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.version);
            stateValue = storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.defaults;
            const initKey = this.getKeyName('init');
            if (!initialized.init) {
                initialized[initKey] = [];
            }
            initialized[initKey].push(this.key);
            console.log(initialized);
        }
        if (data) {
            stateValue = this.toState(data);
        }
        this.checkForMigration(stateValue);
        const useState = react().useState;
        const [state, updateState] = useState(stateValue);
        this.updateState = updateState;
        return [state, this.dispatcher()];
    }
    dispatcher() {
        return {
            update: this.update.bind(this),
            reset: this.reset.bind(this),
            remove: this.remove.bind(this)
        };
    }
    update(data) {
        const keyName = this.getKeyName(this.key);
        this.updateState && this.updateState(data);
        this.save(keyName, data);
    }
    reset() {
        const keyName = this.getKeyName(this.key);
        let defaultValue = this.storageConfig.defaults;
        if (!defaultValue) {
            console.warn(`Definition for storage:${this.key} not found`);
            defaultValue = null;
        }
        this.updateState && this.updateState(defaultValue);
        this.save(keyName, defaultValue);
    }
    remove() {
        const keyName = this.getKeyName(this.key);
        this.updateState && this.updateState(null);
        storage().removeItem(keyName);
    }
    getKeyName(key) {
        const { namespace, delimiter } = config_1.config;
        return namespace ? `${namespace}${delimiter || '/'}${key}` : key;
    }
    toStorage(data) {
        try {
            return JSON.stringify(data);
        }
        catch (error) {
            return data;
        }
    }
    toState(data) {
        try {
            return JSON.parse(data);
        }
        catch (error) {
            return data;
        }
    }
    save(keyName, data) {
        const proccessedData = this.toStorage(data);
        storage().setItem(keyName, proccessedData);
    }
    checkForMigration(currentValue) {
        var _a, _b, _c;
        const track = this.getTrack();
        if (!track[this.key]) {
            this.setTrack(this.key);
        }
        else if (track[this.key].v !== (((_a = this.storageConfig) === null || _a === void 0 ? void 0 : _a.version) || defaultTrackVersion)) {
            const migrationCallback = (_b = this.storageConfig) === null || _b === void 0 ? void 0 : _b.migration;
            if (!migrationCallback) {
                console.error(`Migration method not found for key:${this.key}`);
                return;
            }
            const updatedValue = migrationCallback(currentValue, this.storageConfig.defaults);
            if (!updatedValue) {
                console.error('Expected return value from the callback');
            }
            else {
                this.save(this.getKeyName(this.key), updatedValue);
            }
            this.setTrack(this.key, (_c = this.storageConfig) === null || _c === void 0 ? void 0 : _c.version);
        }
    }
    getTrackName() {
        const { namespace, delimiter } = config_1.config;
        return namespace ? `${namespace}${delimiter}track` : 'track';
    }
    getTrack() {
        if (!track) {
            const trackName = this.getTrackName();
            const trackData = storage().getItem(trackName);
            return this.toState(trackData) || {};
        }
        return track;
    }
    setTrack(key, version = defaultTrackVersion) {
        const trackName = this.getTrackName();
        const track = this.getTrack();
        track[key] = { v: version };
        this.save(trackName, track);
    }
}
const useLocalStorage = (key) => {
    const reactLocalStorageKlass = new ReactLocalStorageKlass(key);
    return reactLocalStorageKlass.init();
};
exports.useLocalStorage = useLocalStorage;
