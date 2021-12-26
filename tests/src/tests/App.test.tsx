import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';


import App from '../App';
import { storageConfig, storageKeyConfig } from '../../..';
import react from 'react';

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

test('set`s default local storage value without namespace & adds track', () => {
  const config = storageConfig({
    react,
    storages: {
      user: storageKeyConfig({
        defaults: {
          name: 'guest'
        }
      })
    }
  });

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
    react,
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

test('removes the local storage value & track', async () => {
  const config = storageConfig({
    namespace: 'gx',
    delimiter: '#',
    react,
    storages: {
      user: storageKeyConfig({
        defaults: {
          name: 'guest'
        }
      })
    }
  })
  render(<App config={config} />);

  await screen.queryByTestId('remove')?.click();
  expect(global.localStorage.store['gx#user']).toBeFalsy();

  const track = JSON.parse((global.localStorage as any).store['gx#track'])
  expect(track['user']).toBeFalsy();
});

test('triggers the migration callback on version increment', async () => {
  // mock store
  global.localStorage.setItem('gm#track', '{"user":{"v":1}}')
  global.localStorage.setItem('gm#user', '{"name":"guest"')

  const config = storageConfig({
    namespace: 'gm',
    delimiter: '#',
    react,
    storages: {
      user: storageKeyConfig({
        defaults: {
          name: 'guest',
          email: 'guest@email.com'
        },
        version: 2,
        migration: jest.fn(x => ({ name: 'guest', email: 'guest@email.com' }))
      }),
    }
  })

  render(<App config={config} />);

  expect(config.storages.user.migration).toBeCalled(); // migration called
  expect(global.localStorage.store['gm#user']).toContain('guest@email.com'); // has migrated value

  const track = JSON.parse(global.localStorage.store['gm#track']);
  expect(track['user'].v).toEqual(config.storages.user.version); // track updated
});




