var hostPackageDir = require('./hostPackageDir');
var ncp = require('ncp');

function initFiles(sourceDir, done) {
  var lifecycleEvent = process.env.npm_lifecycle_event;
  var packageIsInstalling = ((lifecycleEvent === 'install') || (lifecycleEvent === 'postinstall'));
  if (!packageIsInstalling) {
    var error = new Error('This module is meant to be invoked from a package\'s `install` or `postinstall` script.');
    process.nextTick(() => done(error));
    return;
  }

  var destinationDir = hostPackageDir(process.cwd());
  ncp(sourceDir, destinationDir, {
    // Intentionally overwrite the existing files.
    // This lets the file-installing package be updated to push a new version of files to dependents.
    clobber: true
  }, done);
}

module.exports = initFiles;
