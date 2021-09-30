import {getRequest} from "./api";

/**
 * 菜单请求工具类（初始化菜单）
 * @param router
 * @param store
 */

// 初始化菜单，配置路由对象（这样就不用再router/index.js中将路由路径写死了）
export const initMenu = (router, store) => {
    // 已经缓存有对象了，则无需在初始化（routes是在vuex的state中定义的变量）
    if (store.state.routes.length > 0) {
        return;
    }
    // 获取菜单数据
    getRequest('/system/cfg/menu').then(data => {
        if (data) {
            // 格式化路由
            let fmtRoutes = formatRoutes(data);
            // 将格式化好的路由，添加到路由对象中（这样就不用再router/index.js中将路由路径写死了）
            router.addRoutes(fmtRoutes);
            // 将数据存储到vuex的store里面（调用store的mutations中定义的initRoutes方法，将fmtRoutes数据存入state.routes变量中）
            store.commit('initRoutes', fmtRoutes);
        }
    })

}

/**
 * 格式化菜单路由对象
 * @param routes 即请求/system/cfg/menu返回的菜单对象
 * @returns {Array}
 */
export const formatRoutes = (routes) => {
    let fmtRoutes = [];
    routes.forEach(route => {
        // 定义一下每个菜单中的路由对象，即从返回的数据对象中抽取其中某些我们需要的字段
        let {
            path,
            component,
            name,
            iconCls,
            children,
        } = route;
        // 如果有子菜单，即子路由，则递归处理
        if (children && children instanceof Array) {
            // 递归
            children = formatRoutes(children);
        }
        // 格式路由对象
        let fmtRoute = {
            path: path,
            name: name,
            iconCls: iconCls,
            children: children,
            // 格式组件对象，将 “组件名称字符串” 映射到具体的 “组件对象”
            component(resolve) {
                if(component.startsWith('Home')) {
                    require(['../views/' + component + '.vue'], resolve);
                } else if (component.startsWith('Emp')) {
                    require(['../views/emp/'+component+'.vue'], resolve);
                } else if (component.startsWith('Per')) {
                    require(['../views/per/'+component+'.vue'], resolve);
                } else if (component.startsWith('Sal')) {
                    require(['../views/sal/'+component+'.vue'], resolve);
                } else if (component.startsWith('Sta')) {
                    require(['../views/sta/'+component+'.vue'], resolve);
                } else if (component.startsWith('Sys')) {
                    require(['../views/sys/'+component+'.vue'], resolve);
                }
            }
        };
        fmtRoutes.push(fmtRoute);
    });
    return fmtRoutes;
}