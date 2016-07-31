var path = require('path');

/**
 * Determines the directory of the package containing the specified directory.
 *
 * @param {String} dir - The path to a directory, e.g. the directory of a dependency.
 *
 * @return {String} - The path to the package containing _dir_, or `undefined` if the path cannot
 *   be determined e.g. _dir_ is not contained within a package.
 */
function hostPackageDir(dir) {
  var pathComponents = dir.split(path.sep);
  var modulesDirIndex = pathComponents.lastIndexOf('node_modules');
  if (modulesDirIndex < 1) return undefined;

  return pathComponents.slice(0, modulesDirIndex).join(path.sep);
}

module.exports = hostPackageDir;
