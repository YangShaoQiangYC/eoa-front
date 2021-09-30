<template>
    <div>
        <div style="display:flex; justify-content: center; margin-top: 10px;">
            <el-input v-model="keywords" placeholder="请输入用户名进行搜索用户" suffix-icon="el-icon-plus"
                      style="width:400px;margin-right: 10px;"></el-input>
            <el-button type="primary" icon="el-icon-plus" @click="handleSearch"> 搜索</el-button>
        </div>
        <div class="admin-container">
            <el-card class="admin-card" v-for="(admin,index) in admins" :key="index">
                <!-- 卡片头 -->
                <div slot="header" class="clearfix">
                    <span>{{ admin.name }}</span>
                    <el-button style="float: right; padding: 3px 0;color: red" type="text" icon="el-icon-delete"
                               @click="handleDel(admin)"></el-button>
                </div>
                <!-- 卡片内容中的用户头像 -->
                <div>
                    <div class="img-container">
                        <img :src="admin.userFace" :alt="admin.name" :title="admin.name" class="userFace-img">
                    </div>
                </div>
                <!-- 卡片内容 -->
                <div class="userInfo-container">
                    <div>用户名：{{ admin.name }}</div>
                    <div>手机号码：{{ admin.phone }}</div>
                    <div>电话号码：{{ admin.telephone }}</div>
                    <div>地址：{{ admin.address }}</div>
                    <div>用户状态：
                        <el-switch v-model="admin.enabled" active-color="#13ce66" inactive-color="#ff4949"
                                   active-text="启用" inactive-text="禁用" @change="enabledChange(admin)">
                        </el-switch>
                    </div>
                    <div>
                        用户角色：
                        <el-tag style="margin-right: 4px" type="success" v-for="(role,indexj) in admin.roles"
                                :key="indexj">
                            {{ role.nameZh }}
                        </el-tag>
                        <el-popover placement="bottom" title="角色列表" width="200" trigger="click" @show="showRoles(admin)"
                                    @hide="hideRoles(admin)">
                            <!-- selectedRoles中的值，与:value的值匹配到，才是被选中 -->
                            <el-select v-model="selectedRoles" multiple placeholder="请选择">
                                <el-option v-for="(r,index) in allRoles" :key="index" :label="r.nameZh"
                                           :value="r.id"></el-option>
                            </el-select>
                            <!-- 加上slot="reference"的元素，为触发el-popover显示的元素 -->
                            <el-button slot="reference" type="text" icon="el-icon-more"></el-button>
                        </el-popover>
                    </div>
                    <div>备注：{{ admin.remark }}</div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
    export default {
        name: "SysAdmin",
        data() {
            return {
                /** 操作员列表 */
                admins: [],
                /** 查询关键字 */
                keywords: '',
                /** 操作员角色列表 */
                allRoles: [],
                /** 选中的角色 */
                selectedRoles: []
            }
        },
        methods: {
            // 获取操作员列表
            initAdmins() {
                this.getRequest('/system/admin/?keywords=' + this.keywords).then(resp => {
                    if (resp) {
                        this.admins = resp;
                    }
                })
            },
            // 获取所有角色信息
            initAllRoles() {
                this.getRequest('/system/admin/roles').then(resp => {
                    if (resp) {
                        this.allRoles = resp;
                    }
                })
            },
            // 搜索操作员
            handleSearch() {
                this.initAdmins();
            },
            // 删除操作员
            handleDel(admin) {
                this.$confirm('此操作将永久删除该【' + admin.name + '】操作员, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.deleteRequest("/system/admin/" + admin.id).then(resp => {
                        if (resp) {
                            this.initAdmins();
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 启用/禁用操作员
            enabledChange(admin) {
                this.putRequest('/system/admin/update', admin).then(resp => {
                    if (resp) {
                        this.initAdmins();
                    }
                })
            },
            // 弹出框弹出时，显示角色信息
            showRoles(admin) {
                this.initAllRoles();
                // 用户的角色信息
                let roles = admin.roles;
                this.selectedRoles = [];
                roles.forEach(r => {
                    this.selectedRoles.push(r.id);
                })
            },
            // 弹出框隐藏时，更新操作员的角色信息
            hideRoles(admin) {
                // 判断操作员角色信息是否有变更，有变更再发起更新请求
                let flag = false;
                let roles = [];
                Object.assign(roles, admin.roles);
                if (roles.length != this.selectedRoles.length) {
                    // 个数不一致，说明有变动
                    flag = true;
                } else {
                    // 个数一致，则查看元素是否有变动
                    for (let i = 0; i < roles.length; i++) {
                        let role = roles[i];
                        for (let j = 0; j < this.selectedRoles.length; j++) {
                            let roleId = this.selectedRoles[j];
                            // 如果找到了，则从roles中移除
                            if (role.id == roleId) {
                                roles.splice(i, 1);
                                i--;
                                break;
                            }
                        }
                    }
                    // 循环结束如果roles不为空，则证明有变更操作
                    if (roles.length != 0) {
                        flag = true;
                    }
                }
                if (flag) {
                    // 组装请求数据
                    let roleIds = '';
                    this.selectedRoles.forEach(roleId => {
                        roleIds += (roleId + ',')
                    });
                    // 请求修改操作员角色信息
                    this.putRequest('/system/admin/role/update?adminId=' + admin.id + '&rids=' + roleIds).then(resp => {
                        if (resp) {
                            this.initAdmins();
                        }
                    })
                }
            }
        },
        // 页面初始化就要加载数据，一般是放在mounted声明周期中处理
        mounted() {
            this.initAdmins();
        }
    }
</script>

<style>
    .admin-container {
        /** 一行显示 */
        display: flex;
        justify-content: space-between;
        /** 自动换行 */
        flex-wrap: wrap;
        margin-top: 10px;
    }

    /** 加上after伪类，解决最后一排数量不够两端分布的情况 */
    .admin-container:after {
        content: '';
        width: 30%;
        border: 1px solid transparent;
    }

    .admin-card {
        width: 350px;
        margin-bottom: 10px;
    }

    .userFace-img {
        width: 72px;
        height: 72px;
        border-radius: 72px;
    }

    .img-container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .userInfo-container {
        font-size: 12px;
        color: #409eff;
    }
</style>