const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// Register web so Metro resolves *.web.tsx components ahead of native files.
config.resolver.platforms = [...config.resolver.platforms, 'web'];

module.exports = config;
