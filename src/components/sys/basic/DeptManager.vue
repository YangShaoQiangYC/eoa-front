<template>
    <div style="width: 500px;">
        <el-input placeholder="输入部门名称进行搜索..." v-model="filterText" suffix-icon="el-icon-search" clearable></el-input>
        <!-- expand-on-click-node为false时，只有点击树形控件前面的箭头，才有展开和隐藏的效果 -->
        <el-tree :data="depts" :props="defaultProps" default-expand-all :filter-node-method="filterNode"
                 :expand-on-click-node="false" ref="tree" style="margin-top: 10px;">
            <!-- 树形节点自定义操作，node为当前的节点对象，data当前的节点数据 -->
            <span class="custom-tree-node" slot-scope="{ node, data }" style="display: flex;justify-content: space-between;width: 100%;">
                <span>{{ data.name }}</span>
                <span>
                    <el-button type="primary" size="mini" class="deptBtn" @click="() => showAddView(data)">添加</el-button>
                    <el-button type="danger" size="mini" class="deptBtn" @click="() => handleDelete(data)">删除</el-button>
                </span>
            </span>
        </el-tree>
        <!-- 添加部门弹出框 -->
        <el-dialog title="添加部门" :visible.sync="dialogVisible" width="30%">
            <div>
                <table>
                    <tr>
                        <td><el-tag>上级部门</el-tag></td>
                        <td><span style="margin-left: 6px;width: 200px;">{{parentName}}</span></td>
                    </tr>
                    <tr>
                        <td><el-tag>部门名称</el-tag></td>
                        <td>
                            <el-input v-model="dept.name" placeholder="请输入部门名称..." style="margin-left: 6px;width: 200px;"></el-input>
                        </td>
                    </tr>
                </table>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "DeptManager",
        data() {
            return {
                // 搜索字段
                filterText: '',
                // 部门列表数据
                depts: [],
                // 添加部门对象
                dept: {
                    name: '',
                    parentId: -1
                },
                // 上级部门名称
                parentName: '',
                // 树形菜单结构（名称一致，可不写这一个）
                defaultProps: {
                    // 树形结构当前项名称，对应的data属性中每一项的名称
                    label: 'name',
                    // 树形结构当前项的子集
                    children: 'children'
                },
                // 是否显示弹出框
                dialogVisible: false,
            }
        },
        // 观察者事件，观察filterText里面传的值，有值的话，就会去调用执行filter-node-method绑定的方法
        watch: {
            filterText(val) {
                this.$refs.tree.filter(val);
            }
        },
        methods: {
            // 树形控件事件触发，返回true展开树形结构，返回false则隐藏树形结构
            filterNode(value, data) {
                // filterText查找的值为空，就把树形结构展开
                if (!value) return true;
                // data是当前行的数据，data.name是我们通过data中的name属性来进行判断，是否有我们查找的值
                // 如果找到filterText查找的值，就把当前查找的树形结构展开
                return data.name.indexOf(value) !== -1;
            },
            // 获取部门列表
            initDepts() {
                this.getRequest('/department/').then(resp => {
                    if (resp) {
                        this.depts = resp;
                    }
                })
            },
            // 添加部门弹出框初始化
            showAddView(data) {
                // 弹出框
                this.dialogVisible = true;
                // 设置上级部门名称
                this.parentName = data.name;
                // 设置上级部门id
                this.dept.parentId = data.id;
            },
            // 添加部门
            handleAdd() {
                this.postRequest('/department/add', this.dept).then(resp => {
                    if (resp) {
                        // 关闭弹出框
                        this.dialogVisible = false;
                        // 清除下弹出框数据及其初始化的数据
                        this.dept.name = '';
                        this.dept.parentId = -1;
                        this.parentName = '';
                        // 重新初始化页面数据
                        this.initDepts();
                    }
                })
            },
            // 删除部门
            handleDelete(data) {
                if (data.isParent) {
                    this.$message({type: 'error', message: '父部门不能删除！'});
                } else {
                    this.$confirm('此操作将永久删除【' + data.name + '】部门, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.deleteRequest('/department/' + data.id).then(resp => {
                            if (resp) {
                                // 重新加载数据
                                this.initDepts();
                            }
                        })
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消删除'
                        });
                    });
                }
            }
        },
        // 页面初始化就要加载数据，一般是放在mounted声明周期中处理
        mounted() {
            this.initDepts();
        }
    }
</script>

<style>
    .deptBtn {
        padding: 2px;
    }
</style>