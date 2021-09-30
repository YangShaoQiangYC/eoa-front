<template>
    <div>
        <el-container>
            <el-header class="homeHeader">
                <div class="title" style="cursor: pointer" @click="toHome">易办OA</div>
                <el-dropdown class="userInfo" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{ user.name }}
                        <i><img :src="user.userFace"/></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="userInfo">个人中心</el-dropdown-item>
                        <el-dropdown-item command="setting">设置</el-dropdown-item>
                        <el-dropdown-item command="logout">注销登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-header>
            <el-container>
                <el-aside width="200px">
                    <!-- 使用router，启用路由模式 -->
                    <!-- 使用router属性之后，将下面的index属性绑定到routes每个具体路由子项的path，就可以点击菜单实现路由跳转 -->
                    <!-- unique-opened让菜单栏只打开当前，其他菜单栏关闭 -->
                    <el-menu router unique-opened>
                        <!-- 导航一级菜单(index="index"中值为index，index是指获取到路由中的一级菜单个数) -->
                        <el-submenu :index="index+''" v-for="(item, index) in routes" v-if="!item.hidden" :key="index">
                            <!-- 一级菜单名称 -->
                            <template slot="title">
                                <i :class="item.iconCls" style="color: #1accff;margin-right: 5px;"></i>
                                <span>{{ item.name }}</span>
                            </template>
                            <!-- 导航二级菜单 -->
                            <el-menu-item :index="children.path" v-for="(children, indexj) in item.children"
                                          :key="indexj">
                                {{ children.name }}
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>
                </el-aside>
                <el-main>
                    <!-- 首页则不显示面包屑 -->
                    <el-breadcrumb separator-class="el-icon-arrow-right" v-if="this.$router.currentRoute.path != '/home'">
                        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{ this.$router.currentRoute.name }}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <div class="homeWelcome" v-if="this.$router.currentRoute.path == '/home'">
                        欢迎来到易办OA
                    </div>
                    <router-view class="homeRouterView"/>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
    export default {
        name: "Home",
        data() {
            return {
                user: JSON.parse(window.sessionStorage.getItem('user')),
            }
        },
        methods: {
            // 跳回首页
            toHome() {
                this.$router.replace('/home');
            },
            // 注销登录
            handleCommand(command) {
                if (command == 'logout') {
                    this.$confirm('此操作将注销登录, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        // 请求注销登录
                        this.postRequest('/logout').then(resp => {
                            // 接收到注销登录响应
                            if (resp) {
                                // 清除sessionStorage中缓存的token信息和用户信息
                                window.sessionStorage.removeItem('tokenStr');
                                window.sessionStorage.removeItem('user');
                                // 清除vuex存储的菜单信息
                                this.$store.commit('initRoutes', []);
                                // 跳转到登录页
                                this.$router.replace("/");
                            }
                        });
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消操作'
                        });
                    });
                }
            }
        },
        // 自定义计算属性，返回的值与DOM中的数据绑定
        computed: {
            routes() {
                return this.$store.state.routes;
            }
        }
    }
</script>

<style>
    .homeHeader {
        background: #409eff;
        /** 显示一行 */
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 15px;
        box-sizing: border-box;
    }

    .homeHeader .title {
        font-size: 30px;
        font-family: 华文楷体;
        color: white;
    }

    .homeHeader .userInfo {
        cursor: pointer; ;
    }

    .el-dropdown-link img {
        width: 48px;
        height: 48px;
        border-radius: 24px;
        margin-left: 8px;
    }

    .homeWelcome {
        text-align: center;
        font-size: 30px;
        font-family: 华文楷体;
        color: #409eff;
        padding-top: 50px;
    }

    .homeRouterView {
        margin-top: 15px;
    }
</style>