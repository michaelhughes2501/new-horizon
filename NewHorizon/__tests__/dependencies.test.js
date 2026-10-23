// Requires Jest. These configuration regressions do not install dependencies.
const manifest = require('../package.json');
const lockfile = require('../package-lock.json');

describe('React web dependency compatibility', () => {
  it('pins React DOM to the same exact version as React', () => {
    expect(manifest.dependencies.react).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.dependencies['react-dom']).toBe(manifest.dependencies.react);
  });

  it.each(['react', 'react-dom'])('keeps the root lockfile declaration for %s aligned with the manifest', (name) => {
    expect(lockfile.packages[''].dependencies[name]).toBe(manifest.dependencies[name]);
  });

  it.each(['react', 'react-dom'])('locks the resolved %s package to its declared version', (name) => {
    expect(lockfile.packages[`node_modules/${name}`].version).toBe(manifest.dependencies[name]);
  });
});
