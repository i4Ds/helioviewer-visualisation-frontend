const path = require('path')
const sourcePath = path.join(__dirname, './app')

const sassThreadLoader = require('thread-loader')

sassThreadLoader.warmup(
    {
        workerParallelJobs: 2,
    },
    ['sass-loader', 'postcss-loader', 'css-loader', 'style-loader', 'babel-loader'],
)

module.exports = {
    context: sourcePath,
    entry: {
        main: './index.js',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/,
                include: sourcePath,
                use: [
                    {
                        loader: 'thread-loader',
                        options: {
                            workerParallelJobs: 2,
                        },
                    },
                    'babel-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.scss'],
        modules: [path.resolve(__dirname, 'node_modules'), sourcePath],
        symlinks: false,
    },
}
