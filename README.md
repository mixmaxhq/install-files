# install-files

This module lets you share files between projects, e.g. configuration files.

## Why not Git submodules?

`install-files` lets you install files at the root directory of a project, whereas submodules can
only install files in subdirectories.

`install-files` also merges files into existing directories, and lets you customize those directories
thereafter, whereas you'd have to fork a submodule to make custom modifications.

Lastly, `install-files` lets you share files between Node projects the same way you would share code,
using `npm` and declarative package names/versions.

## Example

Let's say you want to share some [`.ebextensions`](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ebextensions.html)
files between several Node microservices. To do that with `install-files`, you'd make a package with
those files, let's call it `my-ebextensions`, with the following directory structure and `package.json`:

```
my-ebextensions/
  node_modules/
  source/
    .ebextensions/
      foo.config
  package.json
```

```
{
  "name": "my-ebextensions",
  "scripts": {
    "install": "install-files source"
  },
  "dependencies": {
    "install-files": "^1.0.0"
  }
}
```

Then, when you install `my-ebextensions` into `my-microservice`, it will copy the contents of
`my-ebextensions/source/` into `my-microservice/`, where you can commit them as appropriate.

Before installing `my-ebextensions`:

```
my-microservice/
  node_modules/
  index.js
  package.json
```

After installing `my-ebextensions`:

```
my-microservice/
  .ebextensions/
    foo.config
  node_modules/
  index.js
  package.json
```

## Installation

```js
npm install install-files --save
```

You install `install-files` into the package with the files to install, as per the [example](#example).

You should recommend that the package with the files to install is installed as a dev dependency
(`npm install my-ebextensions --save-dev`, for example) so that it does not try to install the
files in a production environment. The files should have been installed and committed prior to then
(when the package was installed locally), so this work should be redundant.

It is recommended that you set the `CI` environment variable when `npm install`ing in CI if your CI environment is a `development` environment where you don't want to run `install-files`.

(in project where this module is a transitive dependency; in your CI configuration)

```
CI=true npm install
```

## Usage details

For a quick run-down, see the [example](#example). More details:

`install-files source` will recursively merge `source/` into the host package's directory
(`my-microservice/` in the example), creating subdirectories if necessary. It will not replace
pre-existing files, including in subdirectories, unless `source/` contains files with the same name.

For instance, if `my-microservice/.ebextensions/` already contained `bar.config`, `install-files source`
would not overwrite that. However, `install-files source` would overwrite `foo.config`.

This overwriting behavior lets the file-installing package interoperate with other, project-specific
files, yet control its "own" files.

### Updating the installed files

Modifications to the files should be made by updating the file-installing package, not by editing
the copies.

Update the originals in the file-installing package, then push a new version of the package. When
`npm update` is run in the dependent package, the changes will be copied over.

`install-files` will _not_ prune files that have been removed from `source/`. If you feel that it
should and have ideas about how to do it, please open an issue!

## Contributing

We welcome pull requests! Please lint your code.

### Running tests

To run the Node tests: `npm test`.

## Release History

* 1.1.4 Add yarn support ([#11](https://github.com/mixmaxhq/install-files/issues/11))
* 1.1.3 Ensure install doesn't run on self ([#9](https://github.com/mixmaxhq/install-files/pull/9) - [@GoGoCarl](https://github.com/GoGoCarl))
* 1.1.2 Skip double-installation in CI
* 1.1.1 Fix unnecessary guard that disabled module ([#6](https://github.com/mixmaxhq/install-files/pull/6))
* 1.1.0 Support npm 3 ([#5](https://github.com/mixmaxhq/install-files/pull/5) - [@GoGoCarl](https://github.com/GoGoCarl))
* 1.0.1 Properly determine the host package's directory even if its Node modules are cached elsewhere
* 1.0.0 Initial release.
