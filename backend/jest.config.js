module.exports = {
    textEnviroment: 'node',
    setupFiles : ['./tests/setup.js'],
    collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
};