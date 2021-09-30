// 定义一个代理对象
let proxyObj = {}

// 定义代理对象的转发地址
proxyObj['/'] = {
    // webSocket
    ws: false,
    // 目标地址
    target: 'http://localhost:8081',
    // 将发送请求头host设置为target目标地址
    changeOrigin: true,
    // 不重写请求地址（假如后端接口有前置路径，则需要在这里给加上，例如后端接口都以/sys/admin开头，下面就得修改为'^/':'/sys/admin/'）
    pathReWrite: {
        '^/': '/'
    }
}

// 通过代理转发，处理跨域问题和地址不一致问题
module.exports = {
    devServer: {
        host: 'localhost',
        port: 8080,
        proxy: proxyObj
    }
}
