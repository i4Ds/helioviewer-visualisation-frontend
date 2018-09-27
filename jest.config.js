module.exports = {
    // testEnvironment: "jest-environment-jsdom-global",
    moduleDirectories: ['node_modules', 'app'],
    moduleNameMapper: {
        /*
         * Use proxy to mock CSS Modules. Lookups on the styles object will be returned as-is
         * (e.g., styles.foobar === 'foobar')
         */
        '\\.(css|scss)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.js$': 'babel-jest',
        // Transform file imports into file names
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__mocks__/fileTransformer.js',
    },
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: -10,
        },
    },
}
