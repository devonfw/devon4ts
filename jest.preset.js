const nxPreset = require('@nx/jest/preset').default;

module.exports = { ...nxPreset, coverageReporters: [...nxPreset.coverageReporters, 'lcov', 'cobertura'] };
