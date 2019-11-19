process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

const config = require('config');
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const rules = require('./rules.production');
const resolve = require('./common-resolve');

module.exports = [
    {
        name: 'app',
        target: 'web',
        mode: 'production',
        devtool: 'cheap-module-source-map',

        context: path.join(__dirname, '..', 'app'),
        entry: {
            app: ['./app'],
        },
        output: {
            path: path.join(__dirname, '..', '_build', 'assets'),
            filename: '[name].[hash].js',
            publicPath: '/assets/',
        },
        module: {
            rules,
        },
        resolve,
        plugins: [
            new CleanWebpackPlugin({
                root: path.join(__dirname, '..', '_build'),
            }),
            new HtmlWebpackPlugin({
                title: 'Physiome Submission Portal',
                buildTime: new Date().toString(),
                template: '../app/index-production.html',
                inject: 'body',
                gaHead: ``,
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            }),
            new webpack.ContextReplacementPlugin(/./, __dirname, {
            }),
            new MiniCssExtractPlugin({
                filename: '[name].[hash].css',
                chunkFilename: '[id].css',
            }),
            new CopyWebpackPlugin([{ from: '../static' }]),
            new webpack.optimize.AggressiveMergingPlugin(),
            new webpack.optimize.OccurrenceOrderPlugin()
        ],
        node: {
            fs: 'empty',
            __dirname: true,
        },
    },
];
