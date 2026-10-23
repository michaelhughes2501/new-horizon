// Run from NewHorizon/: node --test __tests__/dependency-compatibility.test.cjs
const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const manifest = require('../package.json');
const lockfile = require('../package-lock.json');

describe('React DOM dependency compatibility', () => {
  it('pins React DOM to the same exact release as React', () => {
    assert.match(manifest.dependencies.react, /^\d+\.\d+\.\d+$/);
    assert.equal(manifest.dependencies['react-dom'], manifest.dependencies.react);
  });

  it('keeps the root lockfile dependency declarations in sync with the manifest', () => {
    for (const name of ['react', 'react-dom']) {
      assert.equal(lockfile.packages[''].dependencies[name], manifest.dependencies[name], name);
    }
  });

  it('locks both installed packages to the matching declared releases', () => {
    for (const name of ['react', 'react-dom']) {
      assert.equal(lockfile.packages[`node_modules/${name}`].version,
        manifest.dependencies[name], name);
    }
  });

  it('satisfies the locked React DOM peer requirement with the pinned React release', () => {
    const reactDom = lockfile.packages['node_modules/react-dom'];
    // semver is already part of Expo's dependency tree. Use its actual range
    // semantics so a repeat of the 19.2.7 versus 19.2.3 conflict fails directly.
    const { satisfies } = require('semver');
    assert.ok(satisfies(manifest.dependencies.react, reactDom.peerDependencies.react),
      'Pinned React must satisfy React DOM\'s peer dependency');
  });
});
