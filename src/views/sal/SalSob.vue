<template>
    <div>
        <div style="display: flex;justify-content: space-between;">
            <el-button type="primary" icon="el-icon-plus" @click="showAddSalaryView">添加工资账套</el-button>
            <el-button type="success" icon="el-icon-refresh" @click="initSalaries"></el-button>
        </div>
        <div style="margin-top: 10px;">
            <el-table :data="salaries" :stripe="true" :border="true" size="small"
                      v-loading="loading"
                      element-loading-text="拼命加载中"
                      element-loading-spinner="el-icon-loading"
                      element-loading-background="rgba(0, 0, 0, 0.8)">
                <!-- 复选框 -->
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" label="账套名称" width="120" fixed="left"></el-table-column>
                <el-table-column prop="basicSalary" label="基本工资" width="80"></el-table-column>
                <el-table-column prop="trafficSalary" label="交通补助" width="80"></el-table-column>
                <el-table-column prop="lunchSalary" label="午餐补助" width="80"></el-table-column>
                <el-table-column prop="bonus" label="奖金" width="70"></el-table-column>
                <el-table-column prop="createDate" label="启用时间" width="100"></el-table-column>
                <el-table-column label="养老金" align="center">
                    <el-table-column prop="pensionPer" label="比率" width="75"></el-table-column>
                    <el-table-column prop="pensionBase" label="基数" width="75"></el-table-column>
                </el-table-column>
                <el-table-column label="医疗保险" align="center">
                    <el-table-column prop="medicalPer" label="比率" width="75"></el-table-column>
                    <el-table-column prop="medicalBase" label="基数" width="75"></el-table-column>
                </el-table-column>
                <el-table-column label="公积金" align="center">
                    <el-table-column prop="accumulationFundPer" label="比率" width="75"></el-table-column>
                    <el-table-column prop="accumulationFundBase" label="基数" width="75"></el-table-column>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template slot-scope="scope">
                        <el-button style="padding: 5px" size="mini" type="primary" @click="showEditSalaryView(scope.row)">编辑</el-button>
                        <el-button style="padding: 5px" size="mini" type="danger" @click="handleDel(scope.row)">删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 添加工资账套弹出框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
            <!-- 居中显示 -->
            <div style="display: flex;justify-content:space-around;align-items: center;">
                <el-steps direction="vertical" :active="activeItemIndex">
                    <el-step :title="itemName" v-for="(itemName,index) in salaryItemName" :key="index"></el-step>
                </el-steps>
                <!-- 这里因为与上面的步骤数组的循环是同步的，数据是一一对应，故输入框的提示信息可以用salaryItemName[index]显示出来 -->
                <!-- 数组对象可以使用 v-for="(value, key, index) in salary 的方式取出数组的下标和相对应的值-->
                <el-input v-model="salary[key]" :placeholder="'请输入' + salaryItemName[index] + '...'"
                          v-for="(value, key, index) in salary"
                          :key="index" v-show="activeItemIndex==index" style="width: 200px;">
                </el-input>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="preStep">{{activeItemIndex==10?'取消':'上一步'}}</el-button>
                <el-button type="primary" @click="nextStep">{{activeItemIndex==10?'完成':'下一步'}}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "SalSob",
        data() {
            return {
                salaries: [],
                // 步骤条默认激活
                activeItemIndex: 0,
                // 添加工资账套弹出框
                dialogVisible: false,
                // 添加工资账套步骤
                salaryItemName: [
                    '账套名称',
                    '基本工资',
                    '交通补助',
                    '午餐补助',
                    '奖金',
                    '养老金比例',
                    '养老金基数',
                    '医疗保险比例',
                    '医疗保险基数',
                    '公积金比例',
                    '公积金基数',
                ],
                // 因为上面的添加工资账套步骤是用for循环显示出来，故这里的顺序需要与上面的同步
                salary: {
                    name: '',
                    basicSalary: 0,
                    trafficSalary: 0,
                    lunchSalary: 0,
                    bonus: 0,
                    pensionPer: 0,
                    pensionBase: 0,
                    medicalPer: 0,
                    medicalBase: 0,
                    accumulationFundPer: 0,
                    accumulationFundBase: 0
                },
                // 工资账套弹框title
                dialogTitle: '',
                // 加载页面
                loading: false,
            }
        },
        methods: {
            // 删除工资账套
            handleDel(data) {
                this.$confirm('此操作将永久删除该【' + data.name + '】工资账套, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 请求批量删除职位接口
                    this.deleteRequest('/salary/sob/' + data.id).then(resp => {
                        if (resp) {
                            this.initSalaries();
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 工资账套弹框上一步
            preStep() {
                if (this.activeItemIndex == 0) {
                    return;
                } else if (this.activeItemIndex == 10) {
                    this.dialogVisible = false;
                    return;
                }
                this.activeItemIndex--;
            },
            // 工资账套弹框下一步
            nextStep() {
                if (this.activeItemIndex == 10) {
                    // id不为空，说明是编辑工资账套
                    if (this.salary.id) {
                        this.putRequest('/salary/sob/update', this.salary).then(resp => {
                            if (resp) {
                                this.initSalaries();
                                this.dialogVisible = false;
                            }
                        })
                    } else {
                        this.postRequest('/salary/sob/add', this.salary).then(resp => {
                            if (resp) {
                                this.initSalaries();
                                this.dialogVisible = false;
                            }
                        });
                    }
                    return;
                }
                this.activeItemIndex++;
            },
            // 添加工资账套弹出框
            showAddSalaryView() {
                // 添加工资账套对象初始化
                this.salary = {
                    name: '',
                    basicSalary: 0,
                    trafficSalary: 0,
                    lunchSalary: 0,
                    bonus: 0,
                    pensionPer: 0,
                    pensionBase: 0,
                    medicalPer: 0,
                    medicalBase: 0,
                    accumulationFundPer: 0,
                    accumulationFundBase: 0
                };
                this.activeItemIndex = 0;
                this.dialogVisible = true;
                this.dialogTitle = "添加工资账套";
            },
            // 编辑工资账套弹出框
            showEditSalaryView(data) {
                this.activeItemIndex = 0;
                this.dialogVisible = true;
                this.dialogTitle = "编辑工资账套";
                // 编辑工资账套对象初始化
                this.salary.id = data.id;
                this.salary.name = data.name;
                this.salary.basicSalary = data.basicSalary;
                this.salary.trafficSalary = data.trafficSalary;
                this.salary.lunchSalary = data.lunchSalary;
                this.salary.bonus = data.bonus;
                this.salary.pensionPer = data.pensionPer;
                this.salary.pensionBase = data.pensionBase;
                this.salary.medicalPer = data.medicalPer;
                this.salary.medicalBase = data.medicalBase;
                this.salary.accumulationFundPer = data.accumulationFundPer;
                this.salary.accumulationFundBase = data.accumulationFundBase;
            },
            // 初始化工资账套数据
            initSalaries() {
                this.loading = true;
                this.getRequest('/salary/sob/').then(resp => {
                    this.loading = false;
                    if (resp) {
                        this.salaries = resp;
                    }
                })
            }
        },
        // 页面初始化就要加载数据，一般是放在mounted声明周期中处理
        mounted() {
            this.initSalaries();
        }
    }
</script>

<style scoped>

</style>