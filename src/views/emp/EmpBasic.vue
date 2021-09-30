<template>
    <div>
        <div>
            <div style="display:flex;justify-content: space-between;">
                <!-- 基本搜索 -->
                <div>
                    <!-- 可清空输入框，@clear事件清空时自动触发-->
                    <el-input suffix-icon="el-icon-search" placeholder="请输入员工名进行搜索..."
                              style="width: 300px;margin-right: 10px;" :disabled="showAdvanceSearchVisible"
                              v-model="empName" @keydown.enter.native="initEmps" clearable @clear="initEmps"></el-input>
                    <el-button icon="el-icon-search" type="primary" @click="initEmps" :disabled="showAdvanceSearchVisible">搜索</el-button>
                    <el-button type="primary" @click="showAdvanceSearchVisible = !showAdvanceSearchVisible">
                        <!-- 双下划线 -->
                        <i :class="showAdvanceSearchVisible ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'" aria-hidden="true"></i>
                        高级搜索
                    </el-button>
                </div>
                <!-- 导入、导出和添加 -->
                <div>
                    <!-- el-upload 是element上传组件，action是请求的接口路径，fileList是选择的文件列表 -->
                    <el-upload style="display: inline-flex;margin-right: 10px;"
                               action="/employee/basic/import"
                               :headers="headers"
                               :show-file-list="false"
                               :disabled="importDataDisabled"
                               :before-upload="beforeUpload"
                               :on-success="onSuccess"
                               :on-error="onError"
                               :file-list="fileList">
                        <el-button type="success" :icon="importDataBtnIcon" :disabled="importDataDisabled">
                            <!--<i class="fa fa-level-up" aria-hidden="true"></i>-->
                            {{ importDataBtnText }}
                        </el-button>
                    </el-upload>
                    <el-button type="success"  @click="exportData" icon="el-icon-download">
                        <!--<i class="fa fa-level-down" aria-hidden="true"></i>-->
                        导出数据
                    </el-button>
                    <el-button type="primary" icon="el-icon-plus" @click="showAddEmpView">
                        添加员工
                    </el-button>
                </div>
            </div>
        </div>
        <transition name="slide-fade">
            <div v-show="showAdvanceSearchVisible" style="border:1px solid #409eff;border-radius: 5px;box-sizing: padding-box;padding: 5px;margin: 10px 0px;">
            <el-row>
                <el-col :span="5">
                    政治面貌：
                    <el-select v-model="searchValue.politicId" placeholder="政治面貌" size="mini" style="width:120px;" clearable>
                        <el-option v-for="item in politicsstatus" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    民族：
                    <el-select v-model="searchValue.nationId" placeholder="民族" size="mini" style="width:120px;" clearable>
                        <el-option v-for="item in nations" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    职位：
                    <el-select v-model="searchValue.posId" placeholder="职位" size="mini" style="width:120px;" clearable>
                        <el-option v-for="item in positions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    职称：
                    <el-select v-model="searchValue.jobLevelId" placeholder="职称" size="mini" style="width:120px;" clearable>
                        <el-option v-for="item in jobLevels" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="7">
                    聘用形式：
                    <el-radio-group v-model="searchValue.engageForm">
                        <el-radio label="劳动合同">劳动合同</el-radio>
                        <el-radio label="劳务合同">劳务合同</el-radio>
                    </el-radio-group>
                </el-col>
            </el-row>
            <el-row style="margin-top: 10px;">
                <el-col :span="5">
                    所属部门：
                    <el-popover placement="bottom" title="请输入部门" width="200" trigger="manual" v-model="visible2">
                        <!-- 树形控件 -->
                        <el-tree :data="allDeps" :props="defaultProps" @node-click="searchHandleNodeClick" default-expand-all></el-tree>
                        <div slot="reference" style="width: 120px;height: 25px;display: inline-flex;border: 1px solid #dedede;border-radius: 4px;cursor:
                                        pointer;align-items: center;font-size: 13px;padding-left: 8px;box-sizing: border-box" @click="showDepView2">{{ searchDepName }}</div>
                    </el-popover>
                </el-col>
                <el-col :span="10">
                    入职日期：
                    <el-date-picker v-model="searchValue.beginDateScope" size="mini" type="daterange" value-format="yyyy-MM-dd"
                                    unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
                    </el-date-picker>
                </el-col>
                <el-col :span="5" offset="4">
                    <el-button size="mini" @click="handleCancelSearch">取消</el-button>
                    <el-button size="mini" :icon="el-icon-search" type="primary" @click="initEmps('advanced')">搜索</el-button>
                </el-col>
            </el-row>
        </div>
        </transition>
        <div style="margin-top: 10px">
            <el-table :data="emps" stripe border="" style="width: 100%"
                      v-loading="loading"
                      element-loading-text="拼命加载中"
                      element-loading-spinner="el-icon-loading"
                      element-loading-background="rgba(0, 0, 0, 0.8)">
                <el-table-column type="selection" width="55"></el-table-column>
                <!-- fixed="left"指列表太长，列表左右滑动时，让该列在左边冻结不动 -->
                <el-table-column prop="name" label="姓名" width="90" align="left" fixed="left"></el-table-column>
                <el-table-column prop="workID" label="工号" width="85" align="left"></el-table-column>
                <el-table-column prop="gender" label="性别" width="50"></el-table-column>
                <el-table-column prop="birthday" label="出生日期" width="95" align="left"></el-table-column>
                <el-table-column prop="idCard" label="身份证号码" width="150" align="left"></el-table-column>
                <el-table-column prop="wedlock" label="婚姻状况" width="70"></el-table-column>
                <el-table-column prop="nation.name" label="民族" width="50"></el-table-column>
                <el-table-column prop="nativePlace" label="籍贯" width="80"></el-table-column>
                <el-table-column prop="politicsStatus.name" label="政治面貌" width="100"></el-table-column>
                <el-table-column prop="email" label="电子邮件" width="180" align="left"></el-table-column>
                <el-table-column prop="phone" label="电话号码" width="100" align="left"></el-table-column>
                <el-table-column prop="address" label="联系地址" width="260" align="left"></el-table-column>
                <el-table-column prop="department.name" label="所属部门" width="100" align="left"></el-table-column>
                <el-table-column prop="joblevel.name" label="职称" width="100" align="left"></el-table-column>
                <el-table-column prop="position.name" label="职位" width="100"></el-table-column>
                <el-table-column prop="engageForm" label="聘用形式" width="100" align="left"></el-table-column>
                <el-table-column prop="tiptopDegree" label="最高学历" width="80"></el-table-column>
                <el-table-column prop="school" label="毕业院校" width="150" align="left"></el-table-column>
                <el-table-column prop="specialty" label="专业" width="150" align="left"></el-table-column>
                <el-table-column prop="workState" label="在职状态" width="70" align="left"></el-table-column>
                <el-table-column prop="beginDate" label="入职日期" width="95" align="left"></el-table-column>
                <el-table-column prop="conversionTime" label="转正日期" width="95" align="left"></el-table-column>
                <el-table-column prop="beginContract" label="合同起始日期" width="95" align="left"></el-table-column>
                <el-table-column prop="endContract" label="合同截止日期" width="95" align="left"></el-table-column>
                <el-table-column label="合同期限" width="100" align="left">
                    <template slot-scope="scope">
                        <el-tag>{{ scope.row.contractTerm }}</el-tag>
                        年
                    </template>
                </el-table-column>
                <!-- fixed="right"指列表太长，列表左右滑动时，让该列在右边冻结不动 -->
                <el-table-column label="操作" width="200" fixed="right">
                    <template slot-scope="scope">
                        <el-button style="padding: 5px" size="mini" @click="showEditEmpView(scope.row)">编辑</el-button>
                        <el-button style="padding: 5px" size="mini" type="primary">查看高级资料</el-button>
                        <el-button style="padding: 5px" size="mini" type="danger" @click="handleDel(scope.row)">删除</el-button>
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
        <!-- 添加员工弹出框 -->
        <el-dialog :title="title" :visible.sync="dialogVisible" width="80%">
            <div>
                <!-- 添加员工使用表单提交，因为表单提交可以有一些校验 -->
                <el-form :rules="rules" ref="empForm" :model="emp">
                    <!-- 使用Layout布局，:gutter指定每个分栏之间的间隔，默认是0 -->
                    <!-- 第一行 -->
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="姓名：" prop="name">
                                <el-input size="mini" style="width: 150px;" placeholder="请输入员工信息" prefix-icon="el-icon-edit" v-model="emp.name" clearable></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">
                            <el-form-item label="性别：" prop="gender">
                                <el-radio-group v-model="emp.gender" style="margin-top: 8px;">
                                    <el-radio label="男">男</el-radio>
                                    <el-radio label="女">女</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="出生日期：" prop="birthday">
                                <el-date-picker v-model="emp.birthday" clearable type="date" size="mini" style="width:150px" value-format="yyyy-MM-dd" placeholder="出生日期"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="政治面貌：" prop="politicId">
                                <el-select v-model="emp.politicId" placeholder="政治面貌" size="mini" style="width:200px;" clearable>
                                    <el-option v-for="item in politicsstatus" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- 第二行 -->
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="民族：" prop="nationId">
                                <el-select v-model="emp.nationId" placeholder="民族" size="mini" style="width:150px;" clearable>
                                    <el-option v-for="item in nations" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">
                            <el-form-item label="籍贯：" prop="nativePlace">
                                <el-input v-model="emp.nativePlace" placeholder="请输入籍贯" prefix-icon="el-icon-edit" size="mini" style="width: 120px;" clearable></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="电子邮箱：" prop="email">
                                <el-input v-model="emp.email" placeholder="请输入邮箱" prefix-icon="el-icon-message" size="mini" style="width:150px;" clearable></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="联系地址：" prop="address">
                                <el-input v-model="emp.address" placeholder="请输入联系地址" prefix-icon="el-icon-edit" size="mini" style="width:200px;" clearable></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- 第三行 -->
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="职位：" prop="posId">
                                <el-select v-model="emp.posId" placeholder="职位" size="mini" style="width:150px;" clearable>
                                    <el-option v-for="item in positions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">
                            <el-form-item label="职称：" prop="jobLevelId">
                                <el-select v-model="emp.jobLevelId" placeholder="职称" size="mini" style="width:150px;" clearable>
                                    <el-option v-for="item in jobLevels" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="所属部门：" prop="departmentId">
                                <!--<el-input v-model="emp.departmentId" placeholder="请输入部门" prefix-icon="el-icon-edit" size="mini" style="width:150px;" clearable></el-input>-->
                                <!-- 选择部门弹出框 -->
                                <el-popover placement="bottom" title="请输入部门" width="200" trigger="manual" v-model="visible">
                                    <!-- 树形控件 -->
                                    <el-tree :data="allDeps" :props="defaultProps" @node-click="handleNodeClick" default-expand-all></el-tree>
                                    <div slot="reference" style="width: 150px;height: 25px;display: inline-flex;border: 1px solid #dedede;border-radius: 4px;cursor:
                                        pointer;align-items: center;font-size: 13px;padding-left: 8px;box-sizing: border-box" @click="showDepView">{{ depName }}</div>
                                </el-popover>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="电话号码：" prop="phone">
                                <el-input v-model="emp.phone" placeholder="请输入电话号码" prefix-icon="el-icon-phone" size="mini" style="width:200px;" clearable></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- 第四行 -->
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="工号：" prop="workID">
                                <el-input v-model="emp.workID" placeholder="请输入工号" prefix-icon="el-icon-edit" size="mini" style="width:150px;" disabled></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">
                            <el-form-item label="学历：" prop="tiptopDegree">
                                <el-select v-model="emp.tiptopDegree" placeholder="学历" size="mini" style="width:150px;" clearable>
                                    <el-option v-for="item in tiptopDegrees" :key="item" :label="item" :value="item"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="毕业院校：" prop="school">
                                <el-input v-model="emp.school" placeholder="请输入学校" prefix-icon="el-icon-edit" size="mini" style="width:150px;" clearable></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="专业名称：" prop="specialty">
                                <el-input v-model="emp.specialty" placeholder="请输入专业" prefix-icon="el-icon-edit" size="mini" style="width:200px;" clearable></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- 第五行 -->
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="入职日期：" prop="beginDate">
                                <el-date-picker v-model="emp.beginDate" clearable type="date" size="mini" style="width:122px" value-format="yyyy-MM-dd" placeholder="入职日期"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">
                            <el-form-item label="转正日期：" prop="conversionTime">
                                <el-date-picker v-model="emp.conversionTime" clearable type="date" size="mini" style="width:122px" value-format="yyyy-MM-dd" placeholder="转正日期"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="合同起始日期：" prop="beginContract">
                                <el-date-picker v-model="emp.beginContract" clearable type="date" size="mini" style="width:122px" value-format="yyyy-MM-dd" placeholder="合同起始日期"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item label="合同截止日期：" prop="endContract">
                                <el-date-picker v-model="emp.endContract" clearable type="date" size="mini" style="width:170px" value-format="yyyy-MM-dd" placeholder="合同截止日期"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- 第六行 -->
                    <el-row>
                        <el-col :span="8">
                            <el-form-item label="身份证号码：" prop="idCard">
                                <el-input v-model="emp.idCard" placeholder="请输入身份证号码" prefix-icon="el-icon-edit" size="mini" style="width:180px;" clearable></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="聘用形式：" prop="engageForm">
                                <el-radio-group v-model="emp.engageForm" style="margin-top: 8px;">
                                    <el-radio label="劳动合同">劳动合同</el-radio>
                                    <el-radio label="劳务合同">劳务合同</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="婚姻状况：" prop="wedlock">
                                <el-radio-group v-model="emp.wedlock" style="margin-top: 8px;">
                                    <el-radio label="已婚">已婚</el-radio>
                                    <el-radio label="未婚">未婚</el-radio>
                                    <el-radio label="离异">离异</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
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
        name: "EmpBasic",
        data() {
            return {
                // 查询字段
                searchValue:{
                    politicId:null,
                    nationId:null,
                    posId:null,
                    jobLevelId:null,
                    engageForm:'',
                    departmentId:null,
                    beginDateScope:null
                },
                // 展示/隐藏高级搜索框属性
                showAdvanceSearchVisible:false,
                // 导入数据相关
                importDataBtnText:'导入数据',
                importDataBtnIcon:'el-icon-upload2',
                importDataDisabled:false,
                // 设置导入数据请求头
                headers:{
                    Authorization:window.sessionStorage.getItem("tokenStr")
                },
                // 弹出框名称
                title:'',
                // 员工信息列表
                emps: [],
                // 加载页面
                loading: false,
                // 数据总条数
                total: 0,
                // 默认当前页及每页条数
                currentPage: 1,
                size: 10,
                // 通过员工名进行查询
                empName: '',
                // 添加员工弹出框弹出标识
                dialogVisible: false,
                // 添加员工表单对象
                emp: {
                    id:null,
                    name: '',
                    gender: '',
                    birthday: '',
                    idCard: '',
                    wedlock: '',
                    nationId: null,
                    nativePlace: '',
                    politicId: null,
                    email: '',
                    phone: '',
                    address: '',
                    departmentId: null,
                    jobLevelId: '',
                    posId: '',
                    engageForm: '',
                    tiptopDegree: '',
                    specialty: '',
                    school: '',
                    beginDate: '',
                    workState: '在职',
                    workID: '',
                    contractTerm: null,
                    conversionTime: '',
                    notWorkDate: null,
                    beginContract: '',
                    endContract: '',
                    workAge: null,
                    salaryId: null
                },
                // 民族
                nations:[],
                // 职称
                jobLevels:[],
                // 政治面貌
                politicsstatus:[],
                // 职位
                positions:[],
                // 学历
                tiptopDegrees:['博士','硕士','本科','大专','中专','高中','初中','小学','其他'],
                // 选择部门弹出框
                visible: false,
                visible2:false,
                // 部门树形控件
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                // 所有部门信息
                allDeps:[],
                // 选中部门回显值
                depName: '',
                searchDepName:'',
                // 表单校验
                rules: {
                    name: [{required: true, message: "请输入员工姓名", trigger: 'blur'}],
                    gender: [{required: true, message: "请输入员工性别", trigger: 'blur'}],
                    birthday: [{required: true, message: "请输入出生日期", trigger: 'blur'}],
                    idCard: [{required: true, message: "请输入身份证号码", trigger: 'blur'},
                        {
                            pattern: /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/,
                            message: "身份证号码不正确",
                            trigger: 'blur'
                        }
                    ],
                    wedlock: [{required: true, message: "请输入婚姻状况", trigger: 'blur'}],
                    nationId: [{required: true, message: "请输入民族", trigger: 'blur'}],
                    nativePlace: [{required: true, message: "请输入籍贯", trigger: 'blur'}],
                    politicId: [{required: true, message: "请输入政治面貌", trigger: 'blur'}],
                    email: [{required: true, message: "请输入邮箱地址", trigger: 'blur'},
                        {type: 'email', message: "邮箱地址格式不正确", trigger: 'blur'}
                        ],
                    phone: [{required: true, message: "请输入电话号码", trigger: 'blur'}],
                    address: [{required: true, message: "请输入员工地址", trigger: 'blur'}],
                    departmentId: [{required: true, message: "请选择部门", trigger: 'blur'}],
                    jobLevelId: [{required: true, message: "请输入职称", trigger: 'blur'}],
                    posId: [{required: true, message: "请输入职位", trigger: 'blur'}],
                    engageForm: [{required: true, message: "请输入聘用形式", trigger: 'blur'}],
                    tiptopDegree: [{required: true, message: "请输入学历", trigger: 'blur'}],
                    specialty: [{required: true, message: "请输入专业", trigger: 'blur'}],
                    school: [{required: true, message: "请输入毕业院校", trigger: 'blur'}],
                    beginDate: [{required: true, message: "请输入入职日期", trigger: 'blur'}],
                    workState: [{required: true, message: "请输入工作状态", trigger: 'blur'}],
                    workID: [{required: true, message: "请输入工号", trigger: 'blur'}],
                    contractTerm: [{required: true, message: "请输入合同期限", trigger: 'blur'}],
                    conversionTime: [{required: true, message: "请输入转正日期", trigger: 'blur'}],
                    notWorkDate: [{required: true, message: "请输入离职日期", trigger: 'blur'}],
                    beginContract: [{required: true, message: "请输入合同起始日期", trigger: 'blur'}],
                    endContract: [{required: true, message: "请输入合同结束日期", trigger: 'blur'}],
                    workAge: [{required: true, message: "请输入工龄", trigger: 'blur'}],
                }
            }
        },
        methods: {
            // 导入数据完成钩子
            onSuccess() {
                this.importDataBtnText = "导入数据";
                this.importDataBtnIcon = "el-icon-upload2"
                this.importDataDisabled = false;
                this.initEmps();
                this.$message({
                    message: '导入数据成功',
                    type: 'success'
                });
            },
            // 导入数据失败钩子
            onError() {
                this.importDataBtnText = "导入数据";
                this.importDataBtnIcon = "el-icon-upload2"
                this.importDataDisabled = false;
                this.$message.error('导入数据失败');
            },
            // 导入数据之前的钩子方法
            beforeUpload() {
                this.importDataBtnText = "正在导入";
                this.importDataBtnIcon = "el-icon-loading";
                this.importDataDisabled = true;
            },
            // 导出数据
            exportData() {
                this.downloadRequest('/employee/basic/export');
            },
            // 编辑员工
            showEditEmpView(data) {
                this.title = "编辑员工信息",
                this.dialogVisible = true;
                this.emp = data;
                // 设置员工部门信息（这里因为使用树形控件，有特殊处理）
                this.depName = data.department.name;
                // 打开对话框加载职位信息（这里是因为考虑职位信息的变动可能较为频繁，所以不存在sessionStorage里，故单独拎出来请求）
                this.initPositions();
            },
            // 删除员工
            handleDel(data) {
                this.$confirm('此操作将永久删除【' + data.name + '】, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.deleteRequest('/employee/basic/' + data.id).then(resp => {
                        if (resp) {
                            // 重新加载数据
                            this.initEmps();
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 添加员工
            handleAdd() {
                this.$refs.empForm.validate((valid) => {
                    if (valid) {
                        if (this.emp.id) {
                            // id不为空就是更新
                            this.putRequest('/employee/basic/update', this.emp).then(resp => {
                                if (resp) {
                                    // 关闭弹出框
                                    this.dialogVisible = false;
                                    // 重新加载数据
                                    this.initEmps();
                                }
                            })
                        } else {
                            // id为空就是新增
                            this.postRequest('/employee/basic/addEmp', this.emp).then(resp => {
                                if (resp) {
                                    // 关闭弹出框
                                    this.dialogVisible = false;
                                    // 重新加载数据
                                    this.initEmps();
                                }
                            })
                        }
                    } else {
                        this.$message.error('错了哦，请输入所有字段！');
                        return false;
                    }
                });
            },
            // 取消高级搜索
            handleCancelSearch() {
                // 清除搜索数据
                this.showAdvanceSearchVisible = false;
                this.visible2 = false;
                this.searchValue = {
                    politicId: null,
                    nationId: null,
                    posId: null,
                    jobLevelId: null,
                    engageForm: '',
                    departmentId: null,
                    beginDateScope: null
                };
                // 重新加载下数据
                this.initEmps();
            },
            // 部门树形控件点击事件
            handleNodeClick(data) {
                // 关闭树形控件
                this.visible = !this.visible;
                // 设置选中的值，并回显
                this.emp.departmentId = data.id;
                this.depName = data.name;
            },
            // 搜索所属部门树形控件点击事件
            searchHandleNodeClick(data) {
                // 关闭树形控件
                this.visible2 = !this.visible2;
                // 设置选中的值，并回显
                this.searchValue.departmentId = data.id;
                this.searchDepName = data.name;
            },
            // 获取所有部门信息
            showDepView() {
                this.visible = !this.visible;
            },
            showDepView2() {
                this.visible2 = !this.visible2;
            },
            // 获取最大工号
            getMaxWorkId() {
                this.getRequest('/employee/basic/maxWorkId').then(resp => {
                    if (resp) {
                        this.emp.workID = resp.obj;
                    }
                })
            },
            // 打开对话框，获取职位信息（因为职位信息可能会变动，所有不存在sessionStorage里面了）
            initPositions() {
                this.getRequest('/employee/basic/positions').then(resp => {
                    if (resp) {
                        this.positions = resp;
                    }
                })
            },
            // 初始化数据，存放不怎么会变动的数据
            initData() {
                // 民族
                if (!window.sessionStorage.getItem('nations')) {
                    this.getRequest('/employee/basic/nations').then(resp => {
                        if (resp) {
                            this.nations = resp;
                            window.sessionStorage.setItem('nations', JSON.stringify(resp));
                        }
                    })
                } else {
                    this.nations = JSON.parse(window.sessionStorage.getItem('nations'));
                }
                // 职称
                if (!window.sessionStorage.getItem('jobLevels')) {
                    this.getRequest('/employee/basic/joblevels').then(resp => {
                        if (resp) {
                            this.jobLevels = resp;
                            window.sessionStorage.setItem('jobLevels', JSON.stringify(resp));
                        }
                    })
                } else {
                    this.jobLevels = JSON.parse(window.sessionStorage.getItem('jobLevels'));
                }
                // 政治面貌
                if (!window.sessionStorage.getItem('politicsstatus')) {
                    this.getRequest('/employee/basic/politicsStatus').then(resp => {
                        if (resp) {
                            this.politicsstatus = resp;
                            window.sessionStorage.setItem('politicsstatus', JSON.stringify(resp));
                        }
                    })
                } else {
                    this.politicsstatus = JSON.parse(window.sessionStorage.getItem('politicsstatus'));
                }
                // 获取所有部门
                if (!window.sessionStorage.getItem('allDeps')) {
                    this.getRequest('/employee/basic/departments').then(resp => {
                        if (resp) {
                            this.allDeps = resp;
                            window.sessionStorage.setItem('allDeps', JSON.stringify(resp));
                        }
                    })
                } else {
                    this.allDeps = JSON.parse(window.sessionStorage.getItem('allDeps'));
                }
            },
            // 初始化员工信息列表
            initEmps(type) {
                this.loading = true;
                let url = "/employee/basic/" + "?currentPage=" + this.currentPage + '&size=' + this.size;
                if (type && type == 'advanced') {
                    // 是高级搜索
                    if (this.searchValue.politicId) {
                        url += '&politicId=' + this.searchValue.politicId;
                    }
                    if (this.searchValue.nationId) {
                        url += '&nationId=' + this.searchValue.nationId;
                    }
                    if (this.searchValue.posId) {
                        url += '&posId=' + this.searchValue.posId;
                    }
                    if (this.searchValue.jobLevelId) {
                        url += '&jobLevelId=' + this.searchValue.jobLevelId;
                    }
                    if (this.searchValue.engageForm) {
                        url += '&engageForm=' + this.searchValue.engageForm;
                    }
                    if (this.searchValue.departmentId) {
                        url += '&departmentId=' + this.searchValue.departmentId;
                    }
                    if (this.searchValue.beginDateScope) {
                        url += '&beginDateScope=' + this.searchValue.beginDateScope;
                    }
                } else {
                    if (this.empName) {
                        url += '&name=' + this.empName;
                    }
                }
                this.getRequest(url).then(resp => {
                    this.loading = false;
                    if (resp) {
                        this.emps = resp.data;
                        // 设置总条数
                        this.total = resp.total;
                    }
                })
            },
            // 显示添加员工弹出框
            showAddEmpView() {
                // 添加弹出框标题
                this.title = "添加员工",
                this.dialogVisible = true;
                // 初始化编辑框内容
                this.emp = {
                    id: null,
                    name: '',
                    gender: '',
                    birthday: '',
                    idCard: '',
                    wedlock: '',
                    nationId: null,
                    nativePlace: '',
                    politicId: null,
                    email: '',
                    phone: '',
                    address: '',
                    departmentId: null,
                    jobLevelId: '',
                    posId: '',
                    engageForm: '',
                    tiptopDegree: '',
                    specialty: '',
                    school: '',
                    beginDate: '',
                    workState: '在职',
                    workID: '',
                    contractTerm: null,
                    conversionTime: '',
                    notWorkDate: null,
                    beginContract: '',
                    endContract: '',
                    workAge: null,
                    salaryId: null
                };
                this.depName = '';
                // 打开对话框加载职位信息
                this.initPositions();
                // 获取最大功耗
                this.getMaxWorkId();
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
            // 初始化基本数据
            this.initData();
            // 初始化职位信息
            this.initPositions();
        }
    }
</script>

<style>
    /* 可以设置不同的进入和离开动画 */
    /* 设置持续时间和动画函数 */
    .slide-fade-enter-active {
        transition: all .8s ease;
    }
    .slide-fade-leave-active {
        transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .slide-fade-enter, .slide-fade-leave-to
        /* .slide-fade-leave-active for below version 2.1.8 */ {
        transform: translateX(10px);
        opacity: 0;
    }
</style>