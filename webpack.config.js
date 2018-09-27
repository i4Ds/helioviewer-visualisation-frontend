const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8082
const sourcePath = path.join(__dirname, './app')
const buildDirectory = path.join(__dirname, './dist')

const sassThreadLoader = require('thread-loader')

sassThreadLoader.warmup(
    {
        workerParallelJobs: 2,
    },
    ['sass-loader', 'postcss-loader', 'css-loader', 'style-loader', 'babel-loader']
)

module.exports = env => {
    const nodeEnv = env && env.prod ? 'production' : 'development'
    const isProd = nodeEnv === 'production'
    const serviceWorkerBuild = env && env.sw

    const htmlTemplate = isProd ? 'index.prod.ejs' : 'index.dev.ejs'

    const plugins = [
        // create index.html
        new HtmlWebpackPlugin({
            template: htmlTemplate,
            inject: true,
            production: isProd,
            preload: ['*.css'],
            minify: isProd && {
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
    ]

    if (isProd) {
        plugins.push(
            // create css bundle
            new ExtractTextPlugin('style-[sha512:contenthash:base64:8].css'),
            new webpack.HashedModuleIdsPlugin()
        )

        cssLoader = ExtractTextPlugin.extract({
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
                        module: true, // css-loader 0.14.5 compatible
                        modules: true,
                        importLoaders: 1,
                        localIdentName: '[hash:base64:5]',
                    },
                },
                {
                    loader: 'sass-loader',
                    options: {
                        outputStyle: 'collapsed',
                        sourceMap: true,
                        includePaths: [sourcePath],
                    },
                },
            ],
        })
    } else {
        plugins.push(
            // make hot reloading work
            new webpack.HotModuleReplacementPlugin()
        )

        cssLoader = [
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
        ]
    }

    if (serviceWorkerBuild)
        plugins.push(
            new SWPrecacheWebpackPlugin({
                cacheId: 'heliovis-timeline',
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
            })
        )

    return {
        mode: nodeEnv,
        context: sourcePath,
        entry: {
            main: './index.js',
        },

        output: {
            path: buildDirectory,
            publicPath: '/',
            filename: isProd ? '[name]-[hash:8].js' : '[name].js',
            chunkFilename: isProd ? '[name]-[chunkhash:8].js' : '[name].js',
        },

        module: {
            rules: [
                {
                    test: /\.(html|svg|jpe?g|png|ttf|woff2?)$/,
                    include: sourcePath,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: isProd ? 'static/[name]-[hash:8].[ext]' : 'static/[name].[ext]',
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.scss$/,
                    include: sourcePath,
                    use: cssLoader,
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

        plugins,

        performance: isProd && {
            maxAssetSize: 300000,
            maxEntrypointSize: 300000,
            hints: 'warning',
        },

        devServer: {
            contentBase: ['./app'],
            publicPath: '/',
            historyApiFallback: true,
            port,
            host,
            hot: !isProd,
            compress: isProd,
        },
    }
}
