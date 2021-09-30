<template>
    <div>
        <div>
            <el-input size="small" class="addPosInput" placeholder="请输入职位" suffix-icon="el-icon-plus"
                      @keydown.enter.native="handleAdd" v-model="pos.name" clearable></el-input>
            <el-button icon="el-icon-plus" type="primary" size="small" @click="handleAdd">添加</el-button>
        </div>
        <div class="posManagerList">
            <el-table :data="positions" :stripe="true" :border="true" size="small" style="width: 70%"
                      @selection-change="handleSelectionChange">
                <!-- 复选框 -->
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="id" label="编号" width="120"></el-table-column>
                <el-table-column prop="name" label="职位" width="180"></el-table-column>
                <el-table-column prop="createDate" label="创建时间" width="150"></el-table-column>
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
                        <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 批量删除 -->
        <el-button size="small" type="danger" style="margin-top: 8px;" :disabled="this.multipleSelection.length == 0"
                   @click="handleBatchDel">批量删除
        </el-button>
        <!-- dialogVisible为true显示弹出框，false隐藏弹出框 -->
        <el-dialog title="编辑职位" :visible.sync="dialogVisible" width="30%">
            <table>
                <tr>
                    <td><el-tag>职位名称</el-tag></td>
                    <td>
                        <el-input v-model="updatePos.name" size="small" style="margin-left: 8px;width: 200px;"></el-input>
                    </td>
                </tr>
                <tr>
                    <td><el-tag>是否启用</el-tag></td>
                    <td>
                        <el-switch style="margin-left: 8px;" v-model="updatePos.enabled" active-color="#13ce66"
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
        name: "PosManager",
        data() {
            return {
                // 新增职位信息
                pos: {
                    name: ''
                },
                // 更新职位信息
                updatePos: {
                    name: '',
                    enabled: ''
                },
                // 职位列表数据
                positions: [],
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
            // 批量删除
            handleBatchDel() {
                this.$confirm('此操作将永久删除【' + this.multipleSelection.length + '】条职位, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 批量删除ids
                    let ids = '';
                    this.multipleSelection.forEach(item => {
                        ids += (item.id + ',');
                    });
                    // 请求批量删除职位接口
                    this.deleteRequest('/system/basic/position/batchDel?ids=' + ids).then(resp => {
                        if (resp) {
                            this.initPositions();
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 添加
            handleAdd() {
                if (this.pos.name) {
                    this.postRequest('/system/basic/position/add', this.pos).then(resp => {
                        if (resp) {
                            this.initPositions();
                        }
                    })
                } else {
                    this.$message.error('职位名称不能为空！');
                }
            },
            // 删除
            handleDelete(index, data) {
                this.$confirm('此操作将永久删除【' + data.name + '】职位, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 请求删除职位接口
                    this.deleteRequest('/system/basic/position/' + data.id).then(resp => {
                        if (resp) {
                            this.initPositions();
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
                Object.assign(this.updatePos, data);
                // 后端不处理createDate字段，但是存在序列化问题，赋个空值
                this.updatePos.createDate = '';
            },
            // 编辑
            handleUpdate() {
                this.putRequest('/system/basic/position/update', this.updatePos).then(resp => {
                    if (resp) {
                        this.initPositions();
                        // 关闭编辑弹出框
                        this.dialogVisible = false;
                    }
                })
            },
            // 初始化数据
            initPositions() {
                this.getRequest('/system/basic/position/').then(resp => {
                    if (resp) {
                        // 清除输入框数据
                        this.pos.name = '';
                        // 初始化数据
                        this.positions = resp;
                    }
                });
            }
        },
        // 页面初始化就要加载数据，一般是放在mounted声明周期中处理
        mounted() {
            this.initPositions();
        }
    }
</script>

<style scoped>
    .addPosInput {
        width: 300px;
        margin-right: 8px;
    }

    .posManagerList {
        margin-top: 10px;
    }
</style>