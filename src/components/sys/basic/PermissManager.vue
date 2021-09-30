<template>
    <div>
        <div class="permissManaTool">
            <el-input size="small" placeholder="请输入角色英文名" v-model="role.name" clearable>
                <template slot="prepend">ROLE_</template>
            </el-input>
            <el-input size="small" placeholder="请输入角色中文名" suffix-icon="el-icon-plus" v-model="role.nameZh"
                      @keydown.enter.native="handleAdd" clearable></el-input>
            <el-button size="small" icon="el-icon-plus" type="primary" @click="handleAdd">添加角色</el-button>
        </div>
        <div style="margin-top: 10px;width: 70%">
            <!-- 手风琴控件 accordion指定手风琴 -->
            <el-collapse v-model="activeName" accordion @change="handleChange">
                <el-collapse-item :title="role.nameZh" :name="role.id" v-for="(role, index) in roles" :key="index">
                    <!-- 卡片控件 -->
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <span>可访问资源</span>
                            <el-button style="float: right; padding: 3px 0;color: #ff0000;" type="text" icon="el-icon-delete" @click="handleDelete(role)"></el-button>
                        </div>
                        <div>
                            <!-- 树形控件，data为数据项，props指定树形数据对应结构 -->
                            <!-- 因为这里有多个角色，所以ref反射出来的tree是一个数组，得通过index获取对应的tree -->
                            <!-- default-checked-keys绑定数据的node-key属性值与data绑定数据的node-key属性值一致，就会打钩 -->
                            <el-tree ref="tree" :data="allMenus" :default-checked-keys="selectedMenus" :props="defaultProps"
                                     show-checkbox node-key="id"></el-tree>
                            <!-- 在树形控件，增加操作按钮 -->
                            <div style="display: flex;justify-content: flex-end">
                                <el-button size="mini" @click="cancelUpdate">取消修改</el-button>
                                <el-button size="mini" type="primary" @click="handleUpdate(role.id, index)">确认修改</el-button>
                            </div>
                        </div>
                    </el-card>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
</template>

<script>
    export default {
        name: "PermissManager",
        data() {
            return {
                role: {
                    name: '',
                    nameZh: ''
                },
                // 角色数据
                roles: [],
                // 所有的菜单数据
                allMenus: [],
                // 选中角色的菜单数据
                selectedMenus: [],
                // 树形菜单结构（名称一致，可不写这一个）
                defaultProps: {
                    // 树形结构当前项名称，对应的data属性中每一项的名称
                    label: 'name',
                    // 树形结构当前项的子集
                    children: 'children'
                },
                // 手风琴默认打开的面板，-1则为全部关闭
                activeName: -1
            }
        },
        methods: {
            // 初始化角色信息
            initRoles() {
                this.getRequest('/system/basic/permission/').then(resp => {
                    if (resp) {
                        // 清除输入框数据
                        this.role.name = '';
                        this.role.nameZh = '';
                        // 角色数据
                        this.roles = resp;
                    }
                })
            },
            // 初始化所有菜单
            initAllMenus() {
                // 先清除下属性信息，再赋值，避免共用属性导致问题
                this.allMenus = [];
                this.getRequest('/system/basic/permission/menus').then(resp => {
                    if (resp) {
                        this.allMenus = resp;
                    }
                })
            },
            // 初始化角色菜单
            initRoleMenus(rid) {
                // 先清除下属性信息，再赋值，避免共用属性导致问题
                this.selectedMenus = [];
                this.getRequest('/system/basic/permission/menus/' + rid).then(resp => {
                    if (resp) {
                        this.selectedMenus = resp;
                    }
                })
            },
            // 折叠面板点击展开触发事件（会将name属性绑定的值传过来）（手风琴折叠面板只会传一个name值，其他的折叠面板会传一个name数组）
            handleChange(rid) {
                // 展开面板
                if (rid) {
                    // 初始化所有权限菜单
                    this.initAllMenus();
                    // 初始化角色权限菜单
                    this.initRoleMenus(rid);
                }
            },
            // 修改角色的权限菜单
            handleUpdate(rid, index) {
                let tree = this.$refs.tree[index];
                // 通过树形控件的getCheckedKeys可获取选中节点的node-key属性值组成的数组
                let selectedKeys = tree.getCheckedKeys(true);
                // 组装请求数据
                let mids = '';
                selectedKeys.forEach(key => {
                    mids += (key + ',')
                });
                // 发送更新角色权限菜单的请求
                this.putRequest('/system/basic/permission/menus/update?rid=' + rid + "&mids=" + mids.substring(0, mids.lastIndexOf(','))).then(resp => {
                    if (resp) {
                        // 关闭手风琴面板
                        this.activeName = -1;
                    }
                })
            },
            // 取消更新
            cancelUpdate() {
                // 关闭手风琴面板
                this.activeName = -1;
            },
            // 添加角色
            handleAdd() {
                if (this.role.name && this.role.nameZh) {
                    this.postRequest('/system/basic/permission/role/add', this.role).then(resp => {
                        if (resp) {
                            // 清除输入框数据
                            this.role.name = '';
                            this.role.nameZh = '';
                            // 再次初始化角色信息
                            this.initRoles();
                        }
                    })
                } else {
                    this.$message.error('字段不能为空！');
                }
            },
            // 删除角色
            handleDelete(role) {
                this.$confirm('此操作将永久删除【' + role.nameZh + '】角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 请求删除职位接口
                    this.deleteRequest('/system/basic/permission/role/' + role.id).then(resp => {
                        if (resp) {
                            this.initRoles();
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            }
        },
        // 页面初始化就要加载数据，一般是放在mounted声明周期中处理
        mounted() {
            this.initRoles();
        }
    }
</script>

<style>
    .permissManaTool {
        /** 显示一行 */
        display: flex;
        /** 内容的摆放位置，居左居右靠中 */
        justify-content: flex-start;
    }

    .permissManaTool .el-input {
        width: 300px;
        margin-right: 6px;
    }
</style>