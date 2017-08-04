#! /usr/bin/env node

var installFiles = require('../src');

var argv = require('yargs')
  .usage('Usage: $0 <sourceDir> [--raw]')
  .demand(1, 'Error: Specify a source directory.')
  .help('h')
  .alias('h', 'help')
  .epilog('Recursively merges `sourceDir` into a host package\'s directory when a dependency is ' +
    'being installed. For more information, see https://github.com/mixmaxhq/install-files.')
  .argv;

var sourceDir = argv._[0];
var raw = argv.raw;

installFiles(sourceDir, raw, function(err) {
  if (err) console.error(err);
});
