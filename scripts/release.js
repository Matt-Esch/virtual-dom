'use strict';
var fs = require('fs');
var semver = require('semver');
var execSync = require('execSync');

var packageFilename = '../package.json';

function release(type) {
  execSync.run('git checkout master');
  var pkg = require(packageFilename);
  pkg.version = semver.inc(pkg.version, type);
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  execSync.run('git commit -a -m "Bumped version to v' + pkg.version + '"');
  execSync.run('git push origin master');
  execSync.run('git tag v' + pkg.version);
  execSync.run('git push origin --tags');
  execSync.run('npm publish');
}

release(process.argv[2] || 'patch');

