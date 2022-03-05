const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const config = {
    entry: path.join(__dirname, '/src/main.ts'),

    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/build/',
        filename: 'project.bundle.js'
    },

    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", options: { allowTsInNodeModules: false }, exclude: "/node_modules/" },
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: "head",
            title: "Phaser example",
            template: path.join(__dirname, "./index.html"),
            chunks: ["tooqing"]
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "assets", to: "assets", toType: "dir" }
            ]
        }),
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        }),
        new CleanWebpackPlugin()
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'build'),
        },
        compress: false,
        allowedHosts: "auto",
        port: 8088,
        devMiddleware: {
            writeToDisk: true,
        }
    }

};
module.exports = (env, argv) => {
    return config;
};
