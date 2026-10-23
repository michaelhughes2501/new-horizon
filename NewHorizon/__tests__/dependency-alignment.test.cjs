// Standalone command (no application dependencies needed):
// node --test __tests__/dependency-alignment.test.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const appRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
const lockfile = JSON.parse(readFileSync(path.join(appRoot, 'package-lock.json'), 'utf8'));

test('React and React DOM remain pinned to the same exact version', () => {
  // A React DOM patch bump without React caused the peer conflict repaired by
  // this PR. Allow coordinated upgrades without freezing this test to 19.2.3.
  assert.match(manifest.dependencies.react, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.dependencies['react-dom'], manifest.dependencies.react);
});

for (const name of ['react', 'react-dom']) {
  test(`${name} agrees between the manifest, root lock entry, and resolved package`, () => {
    const declared = manifest.dependencies[name];
    assert.equal(lockfile.packages[''].dependencies[name], declared);
    assert.equal(lockfile.packages[`node_modules/${name}`].version, declared);
  });
}
