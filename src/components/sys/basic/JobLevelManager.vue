<template>
    <div>
        <div>
            <el-input size="small" v-model="jl.name" placeholder="添加职称等级..." suffix-icon="el-icon-plus"
                      style="width: 300px;" clearable></el-input>
            <el-select size="small" v-model="jl.titleLevel" placeholder="请选择" style="margin-left: 6px;margin-right: 6px;" clearable>
                <el-option v-for="item in titleLevels" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <el-button icon="el-icon-plus" type="primary" size="small" @click="handleAdd">添加</el-button>
        </div>
        <div style="margin-top: 10px;">
            <el-table :data="jls" :border="true" size="small" style="width: 70%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="id" label="编号" width="55"></el-table-column>
                <el-table-column prop="name" label="职称名称" width="120"></el-table-column>
                <el-table-column prop="titleLevel" label="职称等级" width="120"></el-table-column>
                <el-table-column prop="createDate" label="创建日期" width="120"></el-table-column>
                <el-table-column prop="enabled" label="是否启用" width="120">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.enabled" type="success">已启用</el-tag>
                        <el-tag v-else type="danger">未启用</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- scope.$index是所选的数据行，scope.row是所选的数据对象 -->
                        <el-button size="mini" @click="showEditView(scope.$index, scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 批量删除 -->
        <el-button size="small" type="danger" style="margin-top: 8px;" :disabled="this.multipleSelection.length == 0" @click="handleBatchDel">批量删除</el-button>
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑职称" :visible.sync="dialogVisible" width="30%">
            <table>
                <tr>
                    <td><el-tag>职称名称</el-tag></td>
                    <td><el-input v-model="updateJl.name" size="small" style="margin-left: 6px;width: 200px;"></el-input></td>
                </tr>
                <tr>
                    <td><el-tag>职称等级</el-tag></td>
                    <el-select size="small" v-model="updateJl.titleLevel" placeholder="请选择" style="margin-left: 6px;width: 200px;">
                        <el-option v-for="item in titleLevels" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </tr>
                <tr>
                    <td><el-tag>是否启用</el-tag></td>
                    <td>
                        <el-switch style="margin-left: 6px;" v-model="updateJl.enabled" active-color="#13ce66"
                                   inactive-color="#ff4949" active-text="已启用" inactive-text="未启用">
                        </el-switch>
                    </td>
                </tr>
            </table>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="dialogVisible = false">取 消</el-button>
                <el-button size="small" type="primary" @click="handleUpdate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "JobLevelManager",
        data() {
            return {
                // 新增职称
                jl: {
                    name: '',
                    titleLevel: ''
                },
                // 更新职称信息
                updateJl: {
                    name: '',
                    titleLevel: '',
                    enabled:''
                },
                // 职称下拉框
                titleLevels: [
                    '正高级',
                    '副高级',
                    '高级',
                    '中级',
                    '初级',
                ],
                // 职称列表数据
                jls: [],
                // 是否显示弹出框
                dialogVisible: false,
                // 多选框选中的数据对象
                multipleSelection: []
            }
        },
        methods: {
            // 复选框变化触发
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 初始化数据
            initJls() {
                this.getRequest('/system/basic/joblevel/').then(resp => {
                    if (resp) {
                        // 清除输入框数据
                        this.jl.name = '';
                        this.jl.titleLevel = '';
                        // 接口返回数据
                        this.jls = resp;
                    }
                })
            },
            // 添加职称
            handleAdd() {
                if (this.jl.name && this.jl.titleLevel) {
                    this.postRequest('/system/basic/joblevel/add', this.jl).then(resp => {
                        if (resp) {
                            this.initJls();
                        }
                    })
                } else {
                    this.$message.error('字段不能为空！');
                }
            },
            // 删除
            handleDelete(index, data) {
                this.$confirm('此操作将永久删除【' + data.name + '】职称, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 请求删除职称接口
                    this.deleteRequest('/system/basic/joblevel/' + data.id).then(resp => {
                        if (resp) {
                            this.initJls();
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 编辑数据及弹出框初始化
            showEditView(index, data) {
                this.dialogVisible = true;
                // 数值拷贝
                Object.assign(this.updateJl, data);
                // 后端不处理createDate字段，但是存在序列化问题，赋个空值
                this.updateJl.createDate = '';
            },
            // 编辑
            handleUpdate() {
                this.putRequest('/system/basic/joblevel/update', this.updateJl).then(resp => {
                    if (resp) {
                        this.initJls();
                        // 关闭编辑弹出框
                        this.dialogVisible = false;
                    }
                })
            },
            // 批量删除
            handleBatchDel() {
                this.$confirm('此操作将永久删除【' + this.multipleSelection.length + '】条职称, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 批量删除ids
                    let ids = '';
                    this.multipleSelection.forEach(item => {
                        ids += (item.id + ',');
                    });
                    // 请求批量删除职称接口
                    this.deleteRequest('/system/basic/joblevel/batchDel?ids=' + ids).then(resp => {
                        if (resp) {
                            this.initJls();
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
        },
        // 页面初始化就要加载数据，一般是放在mounted声明周期中处理
        mounted() {
            this.initJls();
        }
    }
</script>

<style scoped>

</style>