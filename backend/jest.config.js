module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/setup.js'],
  maxWorkers: 1,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
};