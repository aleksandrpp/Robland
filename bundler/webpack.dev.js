import { merge } from 'webpack-merge'
import { commonConfiguration } from './webpack.common.js'
import config from '../config.js'

export default merge(commonConfiguration, {
    mode: 'development',
    devServer: {
        port: config.port,
        // compress: true,
        hot: true,
        host: '0.0.0.0',
        // contentBase: './public',
        // watchContentBase: true,
        open: true,
        https: false,
        useLocalIp: true,
        disableHostCheck: true,
        // overlay: true,
        noInfo: true,
    },
})
