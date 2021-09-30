import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login'

Vue.use(VueRouter)

// 初始化路由有两种方式，
// 一种最简单的方法是在这里配置写死，
// 一种是通过Vuex请求菜单接口，在store中格式并初始化菜单数据
const routes = [
    {
        path: '/',
        name:'登录',
        component: Login,
        hidden: true
    }
]

const router = new VueRouter({
    routes
})

export default router
