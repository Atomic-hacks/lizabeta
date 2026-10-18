import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync('src/lib/spotify.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup() {
  const scripts = [];
  const timers = new Map();
  let id = 0;
  const window = {
    setTimeout(fn) { timers.set(++id, fn); return id; },
    clearTimeout(key) { timers.delete(key); },
  };
  const document = {
    querySelector() { return scripts[0] ?? null; },
    createElement() {
      return { remove() { const i = scripts.indexOf(this); if (i >= 0) scripts.splice(i, 1); } };
    },
    head: { appendChild(script) { scripts.push(script); } },
  };
  const context = { exports: {}, window, document };
  vm.runInNewContext(source, context);
  return { api: context.exports, window, scripts, timers };
}

test('concurrent loads share a script and cache the ready API', async () => {
  const { api, window, scripts, timers } = setup();
  const first = api.loadEmbedApi();
  assert.equal(first, api.loadEmbedApi());
  assert.equal(scripts.length, 1);
  const controllerApi = {};
  window.onSpotifyIframeApiReady(controllerApi);
  assert.equal(await first, controllerApi);
  assert.equal(await api.loadEmbedApi(), controllerApi);
  assert.equal(timers.size, 0);
});

test('a blocked script can be retried with a fresh request', async () => {
  const { api, window, scripts } = setup();
  const first = api.loadEmbedApi();
  const rejected = assert.rejects(first, /blocked/);
  scripts[0].onerror();
  await rejected;
  assert.equal(scripts.length, 0);
  const retry = api.loadEmbedApi();
  assert.notEqual(first, retry);
  assert.equal(scripts.length, 1);
  const controllerApi = {};
  window.onSpotifyIframeApiReady(controllerApi);
  assert.equal(await retry, controllerApi);
});

test('a timed-out script is removed and can be retried', async () => {
  const { api, window, scripts, timers } = setup();
  const first = api.loadEmbedApi();
  const rejected = assert.rejects(first, /did not load/);
  [...timers.values()][0]();
  await rejected;
  assert.equal(scripts.length, 0);
  const retry = api.loadEmbedApi();
  window.onSpotifyIframeApiReady({});
  await retry;
  assert.equal(timers.size, 0);
});

test('time labels handle invalid and millisecond values', () => {
  const { api } = setup();
  assert.equal(api.formatTime(NaN), '0:00');
  assert.equal(api.formatTime(-1), '0:00');
  assert.equal(api.formatTime(125900), '2:05');
});
