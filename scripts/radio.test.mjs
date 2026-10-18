import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync('src/lib/radio.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText;

// Run the provider with controlled hooks and a Spotify controller, without
// downloading Spotify or depending on a listener's account or browser policy.
function setup() {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], (next) => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }];
    },
    useRef(initial) {
      const i = cursor++;
      return slots[i] ?? (slots[i] = { current: initial });
    },
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useEffect(fn, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) effects.push(() => {
        slots[i]?.cleanup?.();
        slots[i] = { deps, cleanup: fn() };
      });
    },
  };
  const listeners = new Map();
  const calls = { play: 0, resume: 0, destroy: 0, create: 0 };
  const controller = {
    play() { calls.play++; }, resume() { calls.resume++; }, destroy() { calls.destroy++; },
    addListener(name, fn) { listeners.set(name, fn); },
    togglePlay() {}, seek() {}, loadUri() {}, pause() {},
  };
  const embedApi = { createController(mount, options, callback) {
    assert.ok(mount.isConnected);
    calls.create++;
    callback(controller);
  } };
  const context = {
    exports: {}, setTimeout: () => 1, clearTimeout() {},
    document: { createElement: () => ({ isConnected: true }) },
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
      if (name === '@/content/playlist') return {
        RADIO_STORAGE_KEY: 'radio', dragonPlaylist: [], playlistUrl: 'https://open.spotify.com/playlist/test',
        spotifyUriFromUrl: () => 'spotify:playlist:test',
      };
      if (name === './storage') return { readJSONExact: (key, fallback) => fallback, writeJSON() {} };
      if (name === './spotify') return { loadEmbedApi: async () => embedApi, fetchTrackMeta: async () => null };
      throw new Error(`Unexpected module ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  const render = () => {
    cursor = 0;
    effects = [];
    const value = context.exports.RadioProvider({ children: null }).props.value;
    effects.forEach((fn) => fn());
    return value;
  };
  const host = { isConnected: true, children: [], replaceChildren() { this.children = []; }, appendChild(el) { this.children.push(el); } };
  return { render, host, listeners, calls };
}

test('activation waits for ready, paused updates stay paused, and reopening resumes', async () => {
  const { render, host, listeners, calls } = setup();
  let radio = render();
  radio.registerHost(host);
  radio.activate();
  radio = render();
  assert.equal(radio.status, 'loading');
  await Promise.resolve();
  assert.equal(calls.play, 0);
  listeners.get('ready')();
  radio = render();
  assert.equal(radio.status, 'ready');
  assert.equal(calls.play, 1);
  listeners.get('playback_update')({ data: { position: 1200, duration: 30000, isPaused: true } });
  radio = render();
  assert.equal(radio.isPlaying, false);
  assert.equal(calls.resume, 0);
  radio.activate();
  assert.equal(calls.resume, 1);
  assert.equal(calls.create, 1);
});

test('retry mounts into a fresh child while preserving React’s host', async () => {
  const { render, host, listeners, calls } = setup();
  let radio = render();
  radio.registerHost(host);
  radio.activate();
  render();
  await Promise.resolve();
  listeners.get('ready')();
  radio = render();
  const firstMount = host.children[0];
  radio.retry();
  await Promise.resolve();
  assert.equal(calls.destroy, 1);
  assert.equal(calls.create, 2);
  assert.equal(host.children.length, 1);
  assert.notEqual(host.children[0], firstMount);
  listeners.get('ready')();
  radio = render();
  assert.equal(radio.status, 'ready');
  assert.equal(calls.play, 2);
});
