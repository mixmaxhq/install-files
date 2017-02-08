var hostPackageDir = require('./hostPackageDir');
var ncp = require('ncp');
var npmv = require('./npm-version');
var path = require('path');

/**
 * Copies the files contained within _sourceDir_ into a host package's directory when called from
 * a dependency's 'install' or 'postinstall' script.
 *
 * This function will recursively merge _sourceDir_ into the host package's directory, creating
 * subdirectories if necessary. It will not replace pre-existing files, including in subdirectories,
 * unless _sourceDir_ contains files with the same name.
 *
 * This function will return an error if it is not called from a package's 'install' or 'postinstall'
 * script.
 *
 * @param {String} sourceDir - The path to the directory containing the files to be installed.
 * @param {Function<Error>} done - Errback.
 */
function installFiles(sourceDir, done) {
  var lifecycleEvent = process.env.npm_lifecycle_event;
  var packageIsInstalling = ((lifecycleEvent === 'install') || (lifecycleEvent === 'postinstall'));
  if (!packageIsInstalling) {
    var error1 = new Error('This module is meant to be invoked from a package\'s \'install\' or \'postinstall\' script.');
    process.nextTick(() => done(error1));
    return;
  }

  // When this is called from a package's 'install' or 'postinstall' script, this will be the path
  // to `install-files` within that package's `node_modules/.bin` directory.
  var scriptPath = process.env._;

  // The path to the package running the 'install' or 'postinstall' script.
  var fileInstallingPackagePath = hostPackageDir(scriptPath);

  var source, target;
  switch (npmv.majorVersion()) {
    case '3':
      source = path.join(fileInstallingPackagePath, 'node_modules', process.env.npm_package_name, sourceDir);
      target = fileInstallingPackagePath
      break;
    default:
      source = sourceDir;
      target = fileInstallingPackagePath && hostPackageDir(fileInstallingPackagePath);
  }

  if (fileInstallingPackagePath.match(".+" + process.env.npm_package_name + "$")) {
    console.log("[install-files]: Target = self, skipping install")
    return;
  } else if (!target) {
    var error2 = new Error('Could not determine the install destination directory.');
    process.nextTick(() => done(error2));
    return;
  }

  ncp(source, target, {
    // Intentionally overwrite existing files.
    // This lets the file-installing package push a new version of files to dependents when it is updated.
    clobber: true
  }, done);
}

module.exports = installFiles;
