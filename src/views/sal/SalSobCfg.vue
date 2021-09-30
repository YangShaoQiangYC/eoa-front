<template>
    <div>
        <el-table :data="emps" :stripe="true" :border="true" size="small"
                  v-loading="loading"
                  element-loading-text="拼命加载中"
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0.8)">
            <!-- 复选框 -->
            <el-table-column type="selection" width="55" align="left"></el-table-column>
            <el-table-column prop="name" label="姓名" width="120" fixed="left"></el-table-column>
            <el-table-column prop="workID" label="工号" width="120" align="left"></el-table-column>
            <el-table-column prop="email" label="邮箱地址" width="200" align="left"></el-table-column>
            <el-table-column prop="phone" label="电话号码" width="120" align="left"></el-table-column>
            <el-table-column prop="department.name" label="所属部门" width="120" align="left"></el-table-column>
            <el-table-column label="工资账套" align="center">
                <template slot-scope="scope">
                    <!-- <el-tooltip>是弹出提示框的组件 -->
                    <el-tooltip placement="right" v-if="scope.row.salary">
                        <div slot="content">
                            <table>
                                <tr>
                                    <td>基本工资</td>
                                    <td>{{ scope.row.salary.basicSalary }}</td>
                                </tr>
                                <tr>
                                    <td>交通补助</td>
                                    <td>{{ scope.row.salary.trafficSalary }}</td>
                                </tr>
                                <tr>
                                    <td>午餐补助</td>
                                    <td>{{ scope.row.salary.lunchSalary }}</td>
                                </tr>
                                <tr>
                                    <td>奖金</td>
                                    <td>{{ scope.row.salary.bonus }}</td>
                                </tr>
                                <tr>
                                    <td>养老金比率</td>
                                    <td>{{ scope.row.salary.pensionPer }}</td>
                                </tr>
                                <tr>
                                    <td>养老金基数<td>
                                    <td>{{ scope.row.salary.pensionBase }}</td>
                                </tr>
                                <tr>
                                    <td>医疗保险比率</td>
                                    <td>{{ scope.row.salary.medicalPer }}</td>
                                </tr>
                                <tr>
                                    <td>医疗保险基数</td>
                                    <td>{{ scope.row.salary.medicalBase }}</td>
                                </tr>
                                <tr>
                                    <td>公积金比率</td>
                                    <td>{{ scope.row.salary.accumulationFundPer }}</td>
                                </tr>
                                <tr>
                                    <td>公积金基数</td>
                                    <td>{{ scope.row.salary.accumulationFundBase }}</td>
                                </tr>
                            </table>
                        </div>
                        <!-- 鼠标移动到这个标签上，弹出上面<div slot="content">里面的内容 -->
                        <el-tag>{{ scope.row.salary.name }}</el-tag>
                    </el-tooltip>
                    <el-tag type="success" v-else>暂未设置</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" align="center">
                <template slot-scope="scope">
                    <!-- 点击弹出框，@show事件在弹出框显示时触发，@hide事件在弹出框隐藏时触发 -->
                    <el-popover placement="left" title="编辑工资账套" width="200" trigger="click" @show="showPop(scope.row.salary)" @hide="hidePop(scope.row)">
                        <!--加一个工资账套的下拉选择框-->
                        <div>
                            <!-- v-model绑定的值，为当前被选中的el-option的value属性值，一致则为选中 -->
                            <el-select v-model="currentSalary" placeholder="请选择">
                                <el-option v-for="item in salaries" :key="item.id" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </div>
                        <el-button slot="reference" style="padding: 5px" size="mini" type="danger" @click="handleDel(scope.row)">修改工资账套</el-button>
                    </el-popover>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div style="margin-top: 5px;">
            <!-- 分页组件 1.@current-change点击页码时触发，2.@size-change点击页大小时触发 -->
            <!-- 特殊的布局符号->，->后的元素会靠右显示 -->
            <el-pagination background layout="sizes, prev, pager, next, jumper, ->, total"
                           :total="total" @current-change="currentChange" @size-change="sizeChange">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    export default {
        name: "SalSobCfg",
        data() {
            return {
                // 初始化数据
                emps: [],
                // 工资账套
                salaries:[],
                // 数据总条数
                total: 0,
                // 分页参数
                currentPage: 1,
                size: 10,
                // 员工当前的工资账套
                currentSalary:null,
                // 加载页面
                loading: false,
            }
        },
        methods: {
            // 选择工资账套弹出来隐藏时触发
            hidePop(data) {
                if (this.currentSalary && (data.salary.id != this.currentSalary)) {
                    this.putRequest('/salary/sobcfg/update/?eid=' + data.id + '&sid=' + this.currentSalary).then(resp => {
                        if (resp) {
                            this.initEmps();
                        }
                    })
                }
            },
            // 选择工资账套弹出框显示时触发
            showPop(data) {
                if (data) {
                    this.currentSalary = data.id;
                } else {
                    this.currentSalary = null;
                }
            },
            // 初始化工资账套
            initSalaries(){
                this.getRequest('/salary/sobcfg/salaries').then(resp => {
                    if (resp) {
                        this.salaries = resp;
                    }
                })
            },
            // 初始化员工信息
            initEmps() {
                this.loading = true;
                this.getRequest('/salary/sobcfg/'+'?currentPage=' + this.currentPage + '&size=' + this.size).then(resp => {
                    this.loading = false;
                    if (resp) {
                        this.emps = resp.data;
                        // 设置总条数
                        this.total = resp.total;
                    }
                })
            },
            // 分页组件，当前页改变时触发（会自动把当前页currentPage传进来）
            currentChange(currentPage) {
                this.currentPage = currentPage;
                // 重新初始化数据
                this.initEmps();
            },
            // 分页组件，每页显示大小改变时触发（会自动把每页显示大小size传进来）
            sizeChange(size) {
                this.size = size;
                // 重新初始化数据
                this.initEmps();
            }
        },
        // 页面初始化就要加载数据，一般是放在mounted声明周期中处理
        mounted() {
            // 初始化员工信息
            this.initEmps();
            // 初始化工资账套
            this.initSalaries();
        }
    }
</script>

<style scoped>

</style>