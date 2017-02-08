/*
 * Determines the NPM version, if available
 *
 * @return {String} - The full version as a string, or undefined if not available
 */
function getVersion() {
  var version = undefined;
  if (process.env.npm_config_user_agent && process.env.npm_config_user_agent.match(/.*npm\/.+/)) {
    var agent = process.env.npm_config_user_agent.split(' ')
    for (var index in agent) {
      var token = agent[index];
      if (token.indexOf('npm/') == 0) {
        version = token.split('/')[1]
        break;
      }
    }
  }
  return version;
}

function getMajorVersion() {
  var version = getVersion();
  return version ? version[0] : null;
}

module.exports = {
  version: getVersion,
  majorVersion: getMajorVersion
}
