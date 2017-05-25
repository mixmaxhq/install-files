var hostPackageDir = require('./hostPackageDir');
var ncp = require('ncp');
var npmv = require('./npm-version');
var path = require('path');
var fs = require('fs');

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
  /**
   * Return early if the `CI` environment variable is set, since whatever files are expected to be
   * installed by this dependency should have already been checked in in the parent project.
   */
  if (process.env.CI) {
    console.log("[install-files] INFO: Skipping file installation because the `CI` environment variable is set.");
    process.nextTick(done);
    return;
  }

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

  // The target package responsible for the 'install' or 'postinstall' event
  var installTargetPackageName = process.env.npm_package_name;

  var npmVersion = npmv.majorVersion();

  if (npmVersion === '1') {
    console.log("[install-files]: WARNING: npmv1 is not officially supported; unexpected results could occur. Consider upgrading to v2 or later");
  } else if (npmVersion === null) {
    console.log("[install-files]: WARNING: Could not determine npm version");
  }

  var source, target;
  if (npmv.isYarn() || ['1', '2'].indexOf(npmVersion) >= 0) {
    source = sourceDir;
    target = fileInstallingPackagePath && hostPackageDir(fileInstallingPackagePath);
  } else {
    source = path.join(fileInstallingPackagePath, 'node_modules', installTargetPackageName, sourceDir);
    target = fileInstallingPackagePath;
  }

  if (!target) {
    var error2 = new Error('Could not determine the install destination directory.');
    process.nextTick(() => done(error2));
    return;
  }

  // If install destination is the current module, we can silently skip
  if (installTargetPackageName == getModulePackageName(target)) {
    process.nextTick(() => done());
    return;
  }

  ncp(source, target, {
    // Intentionally overwrite existing files.
    // This lets the file-installing package push a new version of files to dependents when it is updated.
    clobber: true
  }, done);
}

/**
 * Attempt to determine the module's package name. If package.json exists, use the name
 * attribute from there; otherwise, infer a name from the directory structure
 *
 * @param {String} target - the target directory
*/
function getModulePackageName(target) {
  var packageName;
  try {
    packageName = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8')).name;
  } catch (e) {
    packageName = path.basename(target);
  }
  return packageName;
}

module.exports = installFiles;
