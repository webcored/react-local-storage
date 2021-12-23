import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';

import App from './App';

class LocalStorageMock {
  public store: any;

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: any) {
    return this.store[key] || null;
  }

  setItem(key: any, value: any) {
    this.store[key] = value;
  }

  removeItem(key: any) {
    delete this.store[key];
  }
}
Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock() });



test('throws error when no react instance is available', () => {
  let error: any;
  try {
    render(<App />);
  } catch(e: any) {
    error = e.stack;
  }

  expect(error).toContain('Please provide the react instance');
});

test('throws warning if no definition found for a key', () => {
  (global as any).console['warn'] = jest.fn();
  const config = {
    storages: {
    }
  }
  render(<App config={config} />);
  expect(console.warn).toBeCalled();
});

test('set`s default local storage value without namespace & adds track', () => {
  const config = {
    storages: {
      user: {
        defaults: {
          name: 'guest'
        }
      }
    }
  }
  render(<App config={config} />);

  expect((global.localStorage as any).store.user).toEqual(JSON.stringify(config.storages.user.defaults));
  const track = JSON.parse((global.localStorage as any).store.track)
  expect(track.user.v).toEqual(1);
});

test('set`s local storage value with given namespace & default delimeter', () => {
  const config = {
    namespace: 'gx',
    storages: {
      user: {
        defaults: {
          name: 'guest'
        }
      }
    }
  }
  render(<App config={config} />);

  const keys = Object.keys(global.localStorage.store);
  expect(keys.includes(`${config.namespace}/user`)).toBeTruthy();
});

test('set`s local storage value with given namespace & delimeter', () => {
  const config = {
    namespace: 'gx',
    delimiter: '#',
    storages: {
      user: {
        defaults: {
          name: 'guest'
        }
      }
    }
  }
  render(<App config={config} />);

  const keys = Object.keys(global.localStorage.store);
  expect(keys.includes(`${config.namespace}#user`)).toBeTruthy();
});

test('updates the local storage value & resets to default', async () => {
  const config = {
    namespace: 'gx',
    delimiter: '#',
    storages: {
      user: {
        defaults: {
          name: 'guest'
        }
      }
    }
  }
  render(<App config={config} />);
  await screen.queryByTestId('update')?.click();
  expect(global.localStorage.store['gx#user']).toContain('Tony Stark');
  await screen.queryByTestId('reset')?.click();
  expect(global.localStorage.store['gx#user']).toContain('guest');
});

test('removes the local storage value', async () => {
  const config = {
    namespace: 'gx',
    delimiter: '#',
    storages: {
      user: {
        defaults: {
          name: 'guest'
        }
      }
    }
  }
  render(<App config={config} />);
  await screen.queryByTestId('remove')?.click();
  expect(global.localStorage.store['gx#user']).toBeFalsy();
});

test('triggers the migration callback on version incremenet', async () => {
  const config = {
    namespace: 'gx',
    delimiter: '#',
    storages: {
      user: {
        defaults: {
          name: 'guest'
        },
        version: 1,
        migration: jest.fn(x => ({ name: 'guest', email: 'guest@email.com' }))
      },
    }
  }
  render(<App config={config} />);

  // update version
  config.storages.user.version += 1;
  render(<App config={config} />);

  expect(config.storages.user.migration).toBeCalled(); // migration called

  expect(global.localStorage.store['gx#user']).toContain('guest@email.com'); // has migrated value

  const track = JSON.parse(global.localStorage.store['gx#track']);
  expect(track['user'].v).toEqual(config.storages.user.version); // track updated
});



