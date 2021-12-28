import configurationsMethods, { config } from './config'
import { CustomDispatcher, StorageTrack, ReactLocalStorage, VersionTrack } from './types'

const { storageConfig, storageKeyConfig } = configurationsMethods

// moved to function avoid these data in every class instance
const react = () => {
  if (!config.react) { throw new Error('Please provide a react instance') }
  return config.react
}

const storage = () => config.storage || window.localStorage

/**
 * tracker flags to avoid computations on re-render
 */
const storageTrack: StorageTrack = {}

let versionTrack: VersionTrack | undefined
const defaultTrackVersion = 1
const trackKey = 'track'
const initKey = 'init'

class ReactLocalStorageKlass {
  /**
   * storge key name
   */
  private readonly key: string;

  /**
   * key config data
   */
  private storageConfig: ReactLocalStorage<any>;

  /**
   * state dispatcher
   */
  private updateState: any;

  constructor (key: string) {
    this.key = key
    this.updateState = null
    this.storageConfig = { defaults: {} }
  }

  // methods
  public init<T> (): [T, CustomDispatcher] {
    const { storages } = config

    const storageConfig = storages[this.key] as ReactLocalStorage<T>
    if (!storageConfig) {
      console.warn(`config definition for storage:${this.key} not found`)
    }

    if (!storageTrack[this.initKey]) { storageTrack[this.initKey] = [] }
    const initialized = storageTrack[this.initKey].includes(this.key)

    // cache config
    this.storageConfig = storageConfig

    const data = storage().getItem(this.keyName)

    // set default values if data not exists
    if (!data && !initialized && storageConfig?.defaults) {
      this.save(this.keyName, storageConfig?.defaults)
      this.setTrack(this.key, storageConfig?.version)
    }

    const stateValue: any = this.toState(data) || (storageConfig?.defaults || null)

    // check for migration
    !initialized && this.checkForMigration(stateValue)

    // state
    const useState = react().useState
    const [state, updateState] = useState(stateValue)

    this.updateState = updateState

    const customDispatcher = this.dispatcher()

    // track storage
    storageTrack[this.initKey].push(this.key)

    return [state, customDispatcher]
  }

  public dispatcher (): CustomDispatcher {
    return {
      update: this.update.bind(this),
      reset: this.reset.bind(this),
      remove: this.remove.bind(this)
    }
  }

  private update (data: any) {
    this.updateState && this.updateState(data)
    this.save(this.keyName, data)
    this.setTrack(this.key, this.storageConfig?.version)
  }

  private reset () {
    const defaultValue = this.storageConfig?.defaults || null
    if (!defaultValue) { this.noDefinitionWaring() }
    this.updateState && this.updateState(defaultValue)
    this.save(this.keyName, defaultValue)
    this.setTrack(this.key, this.storageConfig?.version)
  }

  private remove () {
    storage().removeItem(this.keyName)
    this.removeTrack(this.key)

    // update state
    this.updateState && this.updateState(null)
  }

  /**
   * converts key name with configured namespace & delimeter
   */
  private getKeyName (key: string): string {
    const { namespace, delimiter } = config
    return namespace ? `${namespace}${delimiter || '/'}${key}` : key
  }

  /**
   * storge key name with namespace & delimeter
   */
  private get keyName () {
    return this.getKeyName(this.key)
  }

  /**
   * init key name with namespace & delimeter
   */
  private get initKey () {
    return this.getKeyName(initKey)
  }

  /**
   * track key name with namespace & delimeter
   */
  private get trackKey () {
    return this.getKeyName(trackKey)
  }

  /**
   * converts the data  to supported local stoarge format
   */
  private toStorage (data: any): any {
    try {
      return JSON.stringify(data)
    } catch (error) { // may be string or number
      return data
    }
  }

  /**
   * converts the data to state format
   */
  private toState (data: any): any {
    try {
      return JSON.parse(data)
    } catch (error) { // may be string or number
      return data
    }
  }

  /**
   * Update data to local storage
   * @param key
   * @param data
   */
  private save (key: string, data: any) {
    const proccessedData = this.toStorage(data)
    storage().setItem(key, proccessedData)
  }

  // migrate
  private checkForMigration (currentValue: any) {
    const track = this.getTrack()

    if (!track[this.key]) { // set default version
      this.setTrack(this.key)
    } else if (track[this.key].v !== (this.storageConfig?.version || defaultTrackVersion)) { // migrate if conflict
      const migrationCallback = this.storageConfig?.migration
      if (!migrationCallback) {
        console.error(`Migration method not found for key:${this.key}`)
        return
      }

      // execute callback
      const migratedValue = migrationCallback(currentValue, this.storageConfig.defaults)
      if (!migratedValue) {
        console.error('Expected return value from the callback')
      } else {
        this.save(this.keyName, migratedValue) // save migrated value
      }

      this.setTrack(this.key, this.storageConfig?.version) // update version
    }
  }

  private getTrack (): VersionTrack {
    if (!versionTrack) {
      const trackData = storage().getItem(this.trackKey)
      return this.toState(trackData) || {}
    }

    return versionTrack
  }

  private setTrack (key: string, version: number = defaultTrackVersion) {
    const track = this.getTrack()
    track[this.key] = { v: version }
    this.save(this.trackKey, track)
  }

  private removeTrack (key: string) {
    const track = this.getTrack()
    delete track[key]
    this.save(this.trackKey, Object.assign(track))
  }

  private noDefinitionWaring () {
    console.warn(`config definition for storage:${this.key} not found`)
  }
}

const useLocalStorage = <T>(key: string): [T, CustomDispatcher] => {
  const reactLocalStorageKlass = new ReactLocalStorageKlass(key)
  return reactLocalStorageKlass.init<T>()
}

export {
  useLocalStorage,
  storageConfig,
  storageKeyConfig,
  ReactLocalStorage
}
