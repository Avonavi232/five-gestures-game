module.exports = function () {
    return {
        files: [
            'server.js'
        ],

        tests: [
            '__tests__/*.js'
        ],

        testFramework: 'mocha',

        env: {
            type: 'node'
        }
    };
};