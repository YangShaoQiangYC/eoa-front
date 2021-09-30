<template>
    <div>
        <el-form :rules="rules" ref="loginForm" :model="loginForm" class="loginContainer"
                 v-loading="loading"
                 element-loading-text="正在登录..."
                 element-loading-spinner="el-icon-loading"
                 element-loading-background="rgba(0, 0, 0, 0.8)">
            <h3 class="loginTitle">用户登录</h3>
            <el-form-item prop="username">
                <el-input type="text" auto-complete="false" v-model="loginForm.username"
                          placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password" auto-complete="false" v-model="loginForm.password"
                          placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item prop="code">
                <el-input type="text" auto-complete="false" v-model="loginForm.code" placeholder="点击图片更换验证码"
                          style="width:250px;margin-right: 5px" @keydown.enter.native="submitLogin"></el-input>
                <img :src="captchaUrl" @click="updateCaptcha">
            </el-form-item>
            <el-checkbox v-model="checked" class="loginRemember">记住我</el-checkbox>
            <el-button type="primary" style="width: 100%" @click="submitLogin">登录</el-button>
        </el-form>
    </div>
</template>

<script>
    export default {
        name: "Login",
        data() {
            return {
                captchaUrl: '/captcha?' + new Date(),
                loginForm: {
                    username: 'admin',
                    password: '123',
                    code: '',
                },
                // 默认不显示加载中的过渡效果
                loading: false,
                checked: true,
                rules: {
                    username: [{required: true, message: "请输入用户名", trigger: 'blur'}],
                    password: [{required: true, message: "请输入密码", trigger: 'blur'}],
                    code: [{required: true, message: "请输入验证码", trigger: 'blur'}],
                }
            }
        },
        methods: {
            updateCaptcha() {
                this.captchaUrl = '/captcha?' + new Date();
            },
            submitLogin() {
                // 反射校验表单
                this.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        // 显示正在加载中的过渡效果
                        this.loading = true;
                        this.postRequest('/login', this.loginForm).then(resp => {
                            // 已经响应了，就不要显示正在加载中的登录效果
                            this.loading = false;
                            // 因为有可能被响应拦截器拦截，响应拦截器拦截后这里会返回null，需要特殊处理下
                            if (resp) {
                                // 获取token信息，存储用户token
                                const tokenStr = resp.obj.tokenHead + resp.obj.token;
                                window.sessionStorage.setItem('tokenStr', tokenStr);
                                // 页面跳转：（1.输入的是登录地址或者是错误的地址，则登录后跳转到/home首页；2.否则，登录成功后，跳转到登录之前访问的路径）
                                // push跳转的页面，浏览器可以回退回本页面；replace跳转的页面，浏览器不可以回退回本页面
                                // this.$router.replace("/home");
                                let path = this.$route.query.redirect;
                                this.$router.replace((path=='/'||path==undefined) ? '/home' : path);
                            }
                        })
                    } else {
                        this.$message.error('错了哦，请输入所有字段！');
                        return false;
                    }
                });
            }
        }
    }
</script>

<style>
    .loginContainer {
        border-radius: 15px;
        background-clip: padding-box;
        margin: 180px auto;
        width: 350px;
        padding: 15px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
    }

    .loginTitle {
        margin: 0px auto 40px auto;
        text-align: center;
    }

    .loginRemember {
        margin: 0px 0px 15px 0px;
        text-align: left;
    }

    .el-form-item__content {
        display: flex;
        align-items: center;
    }
</style>