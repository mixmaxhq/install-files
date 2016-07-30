var hostPackageDir = require('../src/hostPackageDir');

describe('hostPackageDir', function() {
  it('should return the host package dir inside a package', function() {
    var dir = '/foo/bar/node_modules/ebextensions';
    expect(hostPackageDir(dir)).toBe('/foo/bar');
  });

  it('should return the host package dir inside a scoped package', function() {
    var dir = '/foo/bar/node_modules/@mixmaxhq/ebextensions';
    expect(hostPackageDir(dir)).toBe('/foo/bar');
  });

  it('should return `undefined` outside a package', function() {
    var dir = '/foo/bar';
    expect(hostPackageDir(dir)).toBeUndefined();
  });
});
