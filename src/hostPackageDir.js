var path = require('path');

/**
 * Determines the directory of the package containing the specified file.
 *
 * @param {String} file - The path to a file.
 *
 * @return {String} - The path to the package containing _file_, or `undefined` if the path cannot
 *   be determined e.g. _file_ is not contained within a package.
 */
function hostPackageDir(file) {
  var pathComponents = file.split(path.sep);
  var modulesDirIndex = pathComponents.lastIndexOf('node_modules');
  if (modulesDirIndex < 1) return undefined;

  return pathComponents.slice(0, modulesDirIndex).join(path.sep);
}

module.exports = hostPackageDir;
