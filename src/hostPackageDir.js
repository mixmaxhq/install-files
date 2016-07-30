var path = require('path');

function hostPackageDir(dir) {
  var pathComponents = dir.split(path.sep);
  var modulesDirIndex = pathComponents.lastIndexOf('node_modules');
  if (modulesDirIndex < 1) return undefined;

  return pathComponents.slice(0, modulesDirIndex).join(path.sep);
}

module.exports = hostPackageDir;
