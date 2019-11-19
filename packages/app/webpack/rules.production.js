const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const include = require('./babel-includes');
const stringReplaceRule = require('./string-replace');

module.exports = [
    stringReplaceRule,
    {
        oneOf: [
            // ES6 JS
            {
                test: /\.jsx?$/,
                include,
                loader: 'babel-loader',
                options: {
                    presets: [
                        [require('@babel/preset-env')],
                        require('@babel/preset-react'),
                    ],
                    plugins: [require('@babel/plugin-proposal-class-properties')]
                },
            },

            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto',
            },


            // CSS
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',
                ],
            },


            // files
            {
                exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                loader: 'file-loader',
                options: {
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
        ],
    },
];
