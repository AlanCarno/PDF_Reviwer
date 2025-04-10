const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const IGNORE_LIST_COMMON = ['**/.DS_Store', '**/.gitkeep']; //通用忽略静态文件列表
/**
 * 部分配置暂未放开，目前扩展利用功能较为简单
 */
module.exports = (env) => {
    const ROOT=path.resolve(__dirname)
    const PUBLIC="public"
    const DIST="dist"
    let entryFile = ""
    if (env && env.filename) {
        // entryFile = `./public/${env.filename}/main.js`
        entryFile = path.resolve(ROOT,PUBLIC,`${env.filename}`,"main.js")
        return {
            resolve: {
                // alias: {
                //     "@": path.resolve(__dirname,"..","public")
                // },
                fallback: {
                    "fs": false,
                    "http": false,
                    "https": false,
                    "url": false,
                    "zlib": false,
                    "stream": false,
                    "crypto": false,
                    "assert": false,
                    "os": false,
                    "path": false,
                    "buffer": false,
                    "querystring": false,
                    "vm": false,
                    "canvas": false,
                    // 需要的时候再安装
                    // "http": require.resolve("stream-http"),
                    // "https": require.resolve("https-browserify"),
                    // "url": require.resolve("url/"),
                    // "zlib": require.resolve("browserify-zlib"),
                    // "stream": require.resolve("stream-browserify"),
                    // "crypto": require.resolve("crypto-browserify"),
                    // "assert": require.resolve("assert/"),
                    // "os": require.resolve("os-browserify/browser"),
                    // "path": require.resolve("path-browserify"),
                    // "buffer": require.resolve("buffer/"),
                    // "querystring": require.resolve("querystring-es3"),
                    // "vm": require.resolve("vm-browserify"),
                }
            },
            entry: entryFile,
            output: {
                filename: 'bundle.js',
                path: path.resolve(ROOT,DIST,`${env.filename}`),
                // 每次构建前清理目标目录
                clean: true,
                // publicPath:"/"
            },
            module: {
                rules: [
                    // {
                    //     // 注：自动引入html-loader且不做任何配置时，会将html中link引入的css、script引入的js路径全部替换，并生成对应的js css文件（js文件名可能还对不上）
                    //     // 所以：还是避免让html-loader去自动解析script标签,且处理css资源时避免两者混用（要么显式声明资源类型)
                    //     test: /\.html$/,
                    //     use: {
                    //         loader: 'html-loader',
                    //         options: {
                    //             sources: {
                    //                 // 手动处理html引入的css、js
                    //                 list: [
                    //                     // 处理css link标签
                    //                     {
                    //                         tag: 'link',
                    //                         attribute: 'href',
                    //                         type: 'src',
                    //                     },
                    //                     // 处理script标签
                    //                     // {
                    //                     //     tag: 'script',
                    //                     //     attribute: 'src',
                    //                     //     type: 'src'
                    //                     // }
                    //                 ],
                    //             }
                    //         }
                    //     }
                    // },

                    // 与html-loader同时存在时，也会影响link标签引入的css文件内容
                    // {
                    //     test: /\.css$/,
                    //     use: [MiniCssExtractPlugin.loader, 'css-loader']
                    //     // use: ['style-loader', 'css-loader']
                    // },
                ]
            },
            plugins: [
                new HtmlWebpackPlugin({
                    template: path.resolve(ROOT,PUBLIC,`${env.filename}`,"index.html"),
                    filename: 'index.html',
                    inject: true,
                    minify:true,
                  }),
                  new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.resolve(ROOT,PUBLIC,`${env.filename}`,"static"),  // 源目录
                            to: 'static',    // 输出目录（相对于output.path）
                            globOptions: {
                                ignore: [...IGNORE_LIST_COMMON]
                            },
                            noErrorOnMissing: true, // 可选：如果static目录不存在不报错
                        },
                        {
                            from: path.resolve(ROOT,PUBLIC,`${env.filename}`,"css"),  // 源目录
                            to: 'css',    // 输出目录（相对于output.path）
                            globOptions: {
                                ignore: [...IGNORE_LIST_COMMON, '**/*.less'], // 忽略less源文件
                                debug:true
                            },
                            noErrorOnMissing: true, // 可选：如果static目录不存在不报错
                        }
                    ]
                }),
                // new MiniCssExtractPlugin({
                //     filename: 'styles.[contenthash].css'
                // }),
            ],
            mode: 'production', // 自动启用压缩
        }
    }
};