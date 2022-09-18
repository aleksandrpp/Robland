import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import { resolve } from './dir.js'

export const commonConfiguration = {
    entry: resolve('../src/index.js'),
    output: {
        filename: 'bundle.[contenthash].js',
        path: resolve('../public'),
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: resolve('../static') }],
        }),
        new HtmlWebpackPlugin({
            template: resolve('../src/index.html'),
            minify: true,
        }),
        new MiniCSSExtractPlugin(),
    ],
    experiments: {
        topLevelAwait: true,
    },
    module: {
        rules: [
            // HTML
            {
                test: /\.(html)$/,
                use: ['html-loader'],
            },

            // JS
            {
                test: /\.?js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },

            // CSS
            {
                test: /\.css$/,
                use: [MiniCSSExtractPlugin.loader, 'css-loader'],
            },

            // Images
            {
                test: /\.(jpg|png|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'assets/images/',
                        },
                    },
                ],
            },

            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'assets/fonts/',
                        },
                    },
                ],
            },
        ],
    },
}
