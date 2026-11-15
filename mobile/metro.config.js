// The web prototype lives one folder up (../src). Let Metro see it, and resolve its
// imports (react, …) from this app's node_modules so there is only one copy of React.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Metro always starts its bundler workers with FORCE_COLOR=1. If the terminal also sets
// NO_COLOR (VS Code / Claude Code do), Node warns once per worker. This config file loads
// before the workers start, so dropping NO_COLOR here silences that warning.
if (process.env.NO_COLOR) delete process.env.NO_COLOR;

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [path.resolve(repoRoot, 'src')];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

module.exports = config;
