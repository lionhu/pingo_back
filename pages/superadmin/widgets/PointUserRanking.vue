<script>
export default {
  name: "superadmin_pointbank_user_ranking",
  props:["user_ranking"],
  components: {
    "el-table": () => import('element-ui/lib/table'),
    "el-table-column": () => import('element-ui/lib/table-column'),
    "el-select": () => import('element-ui/lib/select'),
    "el-option": () => import('element-ui/lib/option'),
  },
  data() {
    return {
      options: [{
        value: '5',
        label: 'Top 5'
      }, {
        value: '10',
        label: 'Top 10'
      }],
      top: 5
    }
  },
  computed: {
    tableData: function () {
      if (this.user_ranking.length){
        return this.user_ranking.slice(0, this.top)
      }
      return []
    }
  },
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between border-bottom  p-2">

        <span class="d-inline-block">User Raking</span>
        <el-select v-model="top" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <el-table
        :data="tableData"
        stripe
        style="width: 100%">
        <el-table-column
          prop="username"
          label="姓名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="total"
          label="Total">
          <template slot-scope="scope">
            {{ scope.row.total|currency("¥") }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
