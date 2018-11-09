const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const common = require('./webpack.common')

const sourcePath = path.join(__dirname, './app')
const buildDirectory = path.join(__dirname, './dist')

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin([buildDirectory], {
            root: __dirname,
            verbose: true,
        }),
        new HtmlWebpackPlugin({
            template: './index.prod.ejs',
            favicon: './icon/favicon.ico',
            inject: true,
            production: true,
            preload: ['*.css'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new ExtractTextPlugin('style-[sha512:contenthash:base64:8].css'),
        new webpack.HashedModuleIdsPlugin(),
        new SWPrecacheWebpackPlugin({
            cacheId: 'heliotime-cache',
            filename: 'sw.js',
            maximumFileSizeToCacheInBytes: 800000,
            mergeStaticsConfig: true,
            minify: true,
            runtimeCaching: [
                {
                    handler: 'cacheFirst',
                    urlPattern: /(.*?)/,
                },
            ],
        }),
    ],
    performance: {
        maxAssetSize: 300000,
        maxEntrypointSize: 300000,
        hints: 'warning',
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    comments: true,
                    compress: {
                        warnings: false,
                        drop_console: true,
                    },
                },
            }),
        ],
    },
    output: {
        path: buildDirectory,
        publicPath: './',
        filename: '[name]-[hash:8].js',
        chunkFilename: '[name]-[chunkhash:8].js',
    },
    module: {
        rules: [
            {
                test: /\.(html|svg|jpe?g|png|ttf|woff2?)$/,
                include: sourcePath,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'static/[name]-[hash:8].[ext]',
                    },
                },
            },
            {
                test: /\.scss$/,
                include: sourcePath,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'cache-loader',
                        {
                            loader: 'thread-loader',
                            options: {
                                workerParallelJobs: 2,
                            },
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true,
                                module: true, // css-loader 0.14.5 compatible
                                modules: true,
                                importLoaders: 1,
                                localIdentName: '[hash:base64:5]',
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                minimize: true,
                                outputStyle: 'collapsed',
                                sourceMap: true,
                                includePaths: [sourcePath],
                            },
                        },
                    ],
                }),
            },
        ],
    },
})
