import axios from 'axios';
import {Message} from 'element-ui';
import router from '../router';

/**
 * 请求api工具类
 */

// 请求拦截器
axios.interceptors.request.use(config => {
    // 如果token存在，则在请求头加个Authorization字段存放token，让所有请求携带这个token
    if (window.sessionStorage.getItem('tokenStr')) {
        config.headers['Authorization'] = window.sessionStorage.getItem('tokenStr');
    }
    return config;
}, error => {
    console.log(error);
});

// 响应拦截器
axios.interceptors.response.use(success => {
    // 成功调用到接口
    if (success.status && success.status == 200) {
        // 请求成功，但是业务逻辑错误
        if (success.data.code == 500 || success.data.code == 401 || success.data.code == 403) {
            Message.error({message: success.data.message});
            return;
        }
        // 请求成功，并有响应成功信息
        if (success.data.message) {
            Message.success({message: success.data.message});
        }
    }
    // 返回数据，传递给下一个拦截器
    return success.data;
}, error => {
    // 没有成功调用到接口
    if (error.response.code == 504 || error.response.code == 404) {
        Message.error({message: '服务器被吃了o(╯□╰)o'});
    } else if (error.response.code == 403) {
        Message.error({message: '权限不足，请联系管理员！'})
    } else if (error.response.code == 401) {
        Message.error({message: '尚未登录，请登录！'})
        // 未登录则跳转到登录页
        router.replace('/');
    } else {
        // 如果有错误信息，则将错误信息打印出来
        if (error.response.data.message) {
            Message.error({message: error.response.data.message});
        } else {
            Message.error({message: '未知错误！'});
        }
    }
    return;
});

let base = '';

// 发送json格式的post请求
export const postRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params
    });
};

// 发送json格式的get请求
export const getRequest = (url, params) => {
    return axios({
        method: 'get',
        url: `${base}${url}`,
        data: params
    });
};

// 发送json格式的put请求
export const putRequest = (url, params) => {
    return axios({
        method: 'put',
        url: `${base}${url}`,
        data: params
    });
};

// 发送json格式的delete请求
export const deleteRequest = (url, params) => {
    return axios({
        method: 'delete',
        url: `${base}${url}`,
        data: params
    });
};