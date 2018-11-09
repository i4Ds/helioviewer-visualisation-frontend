const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')

const common = require('./webpack.common')

const sourcePath = path.join(__dirname, './app')
const buildDirectory = path.join(__dirname, './dist')

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8082

module.exports = merge(common, {
    mode: 'development',
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.dev.ejs',
            favicon: './icon/favicon.ico',
            inject: true,
            production: false,
            preload: ['*.css'],
        }),
        new webpack.HotModuleReplacementPlugin(),
        new OpenBrowserPlugin({ url: `http://${host}:${port}` }),
    ],
    output: {
        path: buildDirectory,
        publicPath: './',
        filename: '[name].js',
        chunkFilename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(html|svg|jpe?g|png|ttf|woff2?)$/,
                include: sourcePath,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'static/[name].[ext]',
                    },
                },
            },
            {
                test: /\.scss$/,
                include: sourcePath,
                use: [
                    // cache css output for faster rebuilds
                    'cache-loader',
                    {
                        // build css/sass in threads (faster)
                        loader: 'thread-loader',
                        options: {
                            workerParallelJobs: 2,
                        },
                    },
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            module: true,
                            importLoaders: 1,
                            localIdentName: '[path][name]-[local]',
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            outputStyle: 'expanded',
                            sourceMap: false,
                            includePaths: [sourcePath],
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        contentBase: ['./app'],
        publicPath: '/',
        historyApiFallback: true,
        port,
        host,
        hot: true,
        compress: false,
    },
})
