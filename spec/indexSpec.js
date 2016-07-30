// This must be required before we denodeify `fs` functions in order to retrieve the patched versions.
var mockFs = require('mock-fs');
var denodeify = require('denodeify');
var initFiles = denodeify(require('../src'));
var readdir = denodeify(require('fs').readdir);
var readFile = denodeify(require('fs').readFile);

describe('initFiles', function() {
  it('should refuse to run outside of a package\'s `install` or `postinstall` script', function(done) {
    initFiles('sourceDir').catch((err) => {
      expect(err).toMatch('install');
      done();
    });
  });

  describe('installing', function() {
    var previousNpmLifecycleEvent;

    beforeEach(function() {
      previousNpmLifecycleEvent = process.env.npm_lifecycle_event;
      process.env.npm_lifecycle_event = 'install';

      // This mirrors a scenario where the user executes `npm install` inside `/foo/bar`;
      // `ebextensions` is the package calling `init-files` from its install script
      // as it is installed into `bar`.
      //
      // The `mockFs` calls below will create the directory structure for this. The other file paths
      // will be relative to this.
      spyOn(process, 'cwd').and.returnValue('/foo/bar/node_modules/ebextensions');

      // Create a mock file system just as safety belts for a test forgetting to do so.
      mockFs();
    });

    afterEach(function() {
      process.env.npm_lifecycle_event = previousNpmLifecycleEvent;
      mockFs.restore();
    });

    it('should merge into the root directory of a package', function(done) {
      mockFs({
        'sourceDir': {
          'file.txt': 'hello world'
        }
      });

      initFiles('sourceDir')
        .then(() => readdir('/foo/bar'))
        .then((files) => expect(files).toEqual(['file.txt', 'node_modules']))
        .then(done)
        .catch((err) => done.fail(err));
    });

    it('should create package subdirectories as needed', function(done) {
      mockFs({
        'sourceDir': {
          'dir': {
            'file.txt': 'hello world'
          }
        }
      });

      initFiles('sourceDir')
        .then(() => readdir('/foo/bar'))
        .then((files) => expect(files).toEqual(['dir', 'node_modules']))
        .then(() => readdir('/foo/bar/dir'))
        .then((files) => expect(files).toEqual(['file.txt']))
        .then(done)
        .catch((err) => done.fail(err));
    });

    it('should merge into a subdirectory of a package', function(done) {
      mockFs({
        '../../dir': {
          'other.txt': 'already here'
        },
        'sourceDir': {
          'dir': {
            'file.txt': 'hello world'
          }
        }
      });

      initFiles('sourceDir')
        .then(() => readdir('/foo/bar'))
        .then((files) => expect(files).toEqual(['dir', 'node_modules']))
        .then(() => readdir('/foo/bar/dir'))
        .then((files) => expect(files).toEqual(['file.txt', 'other.txt']))
        .then(done)
        .catch((err) => done.fail(err));
    });

    // This lets the file-installing package be updated to push a new version of files to dependents.
    it('should overwrite matching files', function(done) {
      mockFs({
        '../../file.txt': 'hello world',
        'sourceDir': {
          'file.txt': 'hi world'
        }
      });

      initFiles('sourceDir')
        .then(() => readdir('/foo/bar'))
        .then((files) => expect(files).toEqual(['file.txt', 'node_modules']))
        .then(() => readFile('/foo/bar/file.txt', 'utf8'))
        .then((fileContents) => expect(fileContents).toBe('hi world'))
        .then(done)
        .catch((err) => done.fail(err));
    });
  });
});
