import { config } from './config'
import { CustomDispatcher, InitTrack, ReactLocalStorage, Track } from './types'

// to avoid this data in every class instance
const react = () => {
  if (!config.react) { throw new Error('Please provide the react instance') }
  return config.react
}

const storage = () => config.storage || window.localStorage

/**
 * default initialization track
 */
const initialized: InitTrack = {}

let track: Track | undefined
const defaultTrackVersion = 1

class ReactLocalStorageKlass {
  constructor (key: string) {
    this.key = key
    this.updateState = null
    this.storageConfig = { defaults: {} }
  }

  // variables
  private readonly key: string;
  /**
   * key config data
   */
  private storageConfig: ReactLocalStorage<any>;
  /**
   * state dispatcher
   */
  private updateState: any;

  // methods
  public init<T> (): [T, CustomDispatcher] {
    const { storages } = config

    const storageConfig = storages[this.key] as ReactLocalStorage<T>
    if (!storageConfig) {
      console.warn(`config definition for storage:${this.key} not found`)
    }

    // cache config
    this.storageConfig = storageConfig

    const keyName = this.getKeyName(this.key)
    let stateValue: any

    // init track
    const initKey = this.getKeyName('init')
    if (!initialized[initKey]) { initialized[initKey] = [] }

    const data = storage().getItem(keyName)
    if (!data && !initialized[initKey].includes(this.key) && storageConfig?.defaults) { // set default values if not exists
      this.save(keyName, storageConfig?.defaults)
      this.setTrack(this.key, storageConfig?.version)
      stateValue = storageConfig?.defaults

      // track initalization
      const initKey = this.getKeyName('init')
      if (!initialized.init) { initialized[initKey] = [] }
      initialized[initKey].push(this.key)

      console.log(initialized)
    }

    // if data exists
    if (data) {
      stateValue = this.toState(data)
    }

    // check for migration
    this.checkForMigration(stateValue)

    // state
    const useState = react().useState
    const [state, updateState] = useState(stateValue)
    this.updateState = updateState

    return [state, this.dispatcher()]
  }

  public dispatcher (): CustomDispatcher {
    return {
      update: this.update.bind(this),
      reset: this.reset.bind(this),
      remove: this.remove.bind(this)
    }
  }

  private update (data: any) {
    const keyName = this.getKeyName(this.key)
    this.updateState && this.updateState(data)
    this.save(keyName, data)
  }

  private reset () {
    const keyName = this.getKeyName(this.key)
    let defaultValue = this.storageConfig.defaults
    if (!defaultValue) {
      console.warn(`Definition for storage:${this.key} not found`)
      defaultValue = null
    }
    this.updateState && this.updateState(defaultValue)
    this.save(keyName, defaultValue)
  }

  private remove () {
    const keyName = this.getKeyName(this.key)
    this.updateState && this.updateState(null)
    storage().removeItem(keyName)
  }

  /**
   * converts key name with configured namespace & delimeter
   */
  private getKeyName (key: string): string {
    const { namespace, delimiter } = config
    return namespace ? `${namespace}${delimiter || '/'}${key}` : key
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
   * @param data
   */
  private save (keyName: string, data: any) {
    const proccessedData = this.toStorage(data)
    storage().setItem(keyName, proccessedData)
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

      const updatedValue = migrationCallback(currentValue, this.storageConfig.defaults)
      if (!updatedValue) {
        console.error('Expected return value from the callback')
      } else {
        this.save(this.getKeyName(this.key), updatedValue) // save migrated value
      }

      this.setTrack(this.key, this.storageConfig?.version) // update version
    }
  }

  private getTrackName (): string {
    const { namespace, delimiter } = config
    return namespace ? `${namespace}${delimiter}track` : 'track'
  }

  private getTrack (): Track {
    if (!track) {
      const trackName = this.getTrackName()
      const trackData = storage().getItem(trackName)
      return this.toState(trackData) || {}
    }

    return track
  }

  private setTrack (key: string, version: number = defaultTrackVersion) {
    const trackName = this.getTrackName()
    const track = this.getTrack()
    track[key] = { v: version }
    this.save(trackName, track)
  }
}

const useLocalStorage = <T>(key: string): [T, CustomDispatcher] => {
  const reactLocalStorageKlass = new ReactLocalStorageKlass(key)
  return reactLocalStorageKlass.init<T>()
}

export {
  useLocalStorage,
  ReactLocalStorage
}
