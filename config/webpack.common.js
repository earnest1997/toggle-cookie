/* eslint-disable global-require */
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const rootDir = path.resolve(__dirname, '..');
const wrapperClassName = 'chrome-extension-base-class-cookie-manager';
console.log(wrapperClassName, 99);
const postCssPlugins = [
    require('autoprefixer'),
    require('postcss-plugin-namespace')(`.${wrapperClassName}`, { ignore: ['#chrome-extension-content-base-element', /^((?!\.ant-btn).)*$/] })
];

module.exports = {
    entry: {
        popup: './src/popup',
        background: './src/background',
        contentScripts: './src/content-scripts',
        demo: './src/view/setting'
    },
    output: {
        path: path.resolve(rootDir, './dist/js'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    modules: false,
                                    useBuiltIns: 'usage',
                                    corejs: {
                                        version: 3,
                                        proposals: true
                                    }
                                }
                            ],
                            '@babel/preset-react'
                        ],
                        plugins: [
                            ['@babel/plugin-proposal-decorators', { legacy: true }],
                            ['@babel/plugin-proposal-class-properties'],
                            ['babel-plugin-import', {
                                libraryName: 'antd',
                                libraryDirectory: 'es',
                                style: true
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                ident: 'postcss',
                                plugins: postCssPlugins
                            }
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                ident: 'postcss',
                                plugins: postCssPlugins
                            }
                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                modifyVars: {
                                    'primary-color': '#722ed1'
                                },
                                javascriptEnabled: true
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(scss|sass)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                ident: 'postcss',
                                plugins: postCssPlugins
                            }
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|gif|jpeg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: 'static/[name]-[hash].[ext]'
                    }
                }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '../css/[name].css'
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(rootDir, 'public/icons'),
                    to: path.resolve(rootDir, 'dist/icons')
                },
                {
                    from: path.resolve(rootDir, 'public/images'),
                    to: path.resolve(rootDir, 'dist/images')
                },
                {
                    from: path.resolve(rootDir, 'public/manifest.json'),
                    to: path.resolve(rootDir, 'dist/manifest.json')
                }
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(rootDir, 'public/html/popup.html'),
            filename: path.resolve(rootDir, 'dist/html/popup.html'),
            chunks: ['popup'] // 该页面要引用哪些 chunk （即上面入口文件），不写的话默认是全部引用
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(rootDir, 'public/html/view.html'),
            filename: path.resolve(rootDir, 'dist/html/view.html'),
            chunks: ['demo']
        }),
        new webpack.DefinePlugin({
            WRAPPER_CLASS_NAME: `'${wrapperClassName}'` // 防止插件的样式被污染或者是当前页面的样式污染插件的样式
        })
    ]
};
