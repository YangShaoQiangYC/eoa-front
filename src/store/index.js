import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

/**
 * vuex存储对象
 */

// 返回一个store对象，可以保存所有组件的公共数据
export default new Vuex.Store({
    // 全局对象，用来保存所有组件公共的数据
    state: {
        // 定义一个数组
        routes: []
    },
    // 在mutations中定义同步更新state中值的方法
    mutations: {
        // 参数一的state，即为上面vuex的state全局变量
        // 参数二的data，即为传进来的变量值
        initRoutes(state, data) {
            state.routes = data;
        }
    },
    // 在actions中定义异步更新state中值的方法
    actions: {}
})