import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 引入element
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 引入font-awesome样式(npm install font-awesome)
import 'font-awesome/css/font-awesome.css'
// 引入自定义工具类（全局），这样在工具类的时候，就不用再import导入了
import {postRequest} from "./utils/api";
import {getRequest} from "./utils/api";
import {putRequest} from "./utils/api";
import {deleteRequest} from "./utils/api";
// 需要引入js-file-download插件 npm install js-file-download
import {downloadRequest} from "./utils/download";
// 引入使用Vuex的store（会自动把store中的vuex导入进来）(npm install vuex --save)
import store from './store'
import {initMenu} from "./utils/menus";

// 关闭浏览器控制台关于环境相关的提示
Vue.config.productionTip = false
// 在vue脚手架中使用elementUI
// Vue.use(ElementUI);
// 指定所有ElementUI控件的默认大小为small
Vue.use(ElementUI, {size: 'small'});

// 以插件的形式引用自定义工具类（将插件设置进vue全局对象）
Vue.prototype.postRequest = postRequest;
Vue.prototype.getRequest = getRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.downloadRequest = downloadRequest;

// 路由导航守卫（在所有路由跳转前，都会经过执行路由导航守卫）（有点像拦截器，过滤器这种）
router.beforeEach((to, from, next) => {
    // 用户如果已经登录，则初始化菜单
    if (window.sessionStorage.getItem('tokenStr')) {
        // 初始化菜单
        initMenu(router, store);
        // 获取一下当前登录用户信息
        if (!window.sessionStorage.getItem('user')) {
            return getRequest('/admin/info').then(resp => {
                if (resp) {
                    // 存入用户信息（sessionStorage只能存储字符串，故需要json转一下）
                    window.sessionStorage.setItem('user', JSON.stringify(resp));
                    next();
                }
            })
        }
        // next()表示跳转到to的那个路由（注释掉则不会跳转到to的那个路由）
        // next(false);中断跳转到to的那个路由
        // next('/');跳转到指定路由，不会跳转到to的那个路由
        next();
    } else
    // 用户如果未登录
    if (to.path == '/') {
        // 如果访问的就是登录页，则直接跳转吧
        next();
    } else {
        // 如果访问的不是登录页，则先登录，再调整到指定的页面（把要调整的页面传参过去登录页面）
        next('/?redirect=' + to.path);
    }
    next();
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
