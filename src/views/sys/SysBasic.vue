<template>
    <div>
        <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="部门管理" name="DeptManager">
                <DeptManager></DeptManager>
            </el-tab-pane>
            <el-tab-pane label="职位管理" name="PosManager">
                <PosManager></PosManager>
            </el-tab-pane>
            <el-tab-pane label="职称管理" name="JobLevelManager">
                <JobLevelManager></JobLevelManager>
            </el-tab-pane>
            <el-tab-pane label="奖惩规则" name="EcManager">
                <EcManager></EcManager>
            </el-tab-pane>
            <el-tab-pane label="权限组" name="PermissManager">
                <PermissManager></PermissManager>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import DeptManager from '../../components/sys/basic/DeptManager'
    import EcManager from '../../components/sys/basic/EcManager'
    import JobLevelManager from '../../components/sys/basic/JobLevelManager'
    import PermissManager from '../../components/sys/basic/PermissManager'
    import PosManager from '../../components/sys/basic/PosManager'

    export default {
        name: "SysBasic",
        data() {
            return {
                activeName: 'DeptManager'
            };
        },
        components: {
            DeptManager,
            EcManager,
            JobLevelManager,
            PermissManager,
            PosManager
        }
    }
</script>

<style scoped>

</style>