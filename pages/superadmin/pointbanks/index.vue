<script>
import {mapGetters} from "vuex"
import Swal from "sweetalert2";
import {axios} from '@/plugins/axios.js';

export default {
  name: "admin_pointbanks_management",
  head() {
    return {
      title: `${this.title} | WAVUS, PINGO`,
      script: [
        {src: 'https://unpkg.com/element-ui/lib/index.js'}
      ],
      link: [
        {rel: 'stylesheet', href: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'}
      ]
    };
  },
  components: {
    "el-table": () => import('element-ui/lib/table'),
    "el-table-column": () => import('element-ui/lib/table-column'),
    "el-date-picker": () => import('element-ui/lib/date-picker'),
    "el-autocomplete": () => import('element-ui/lib/autocomplete'),
    "el-select": () => import('element-ui/lib/select'),
    "el-option": () => import('element-ui/lib/option'),
  },
  computed: {
    ...mapGetters({})
  },
  data() {
    return {
      title: "Pointbanks",
      items: [
        {
          text: "PINGO"
        },
        {
          text: "eCommerce"
        },
        {
          text: "Margins",
          active: true
        }
      ],
      filters: {
        until_at__gte: new Date().toISOString(),
        until_at__lte: this.year_after(),
        user_id: "",
      },
      selectUsername: "",
      userlist: [],
      multipleSelection: [],
      isLoading: false,
      pointbanks: [],
      loading: false,
      value: ""
    };
  },
  methods: {
    week_before() {
      var dt = new Date();
      return new Date(dt.setDate(dt.getDate() - 7)).toISOString();
    },
    year_after() {
      var dt = new Date();
      return new Date(dt.setDate(dt.getDate() + 365)).toISOString();
    },
    load_margins() {
      let vm = this;
      this.isLoading = true;
      if (this.filters.user_id===""){
        this.filters.user_id=0
      }
      axios.$post("/admin_back/api/pointbanks/list_filters/", {filters: this.filters})
        .then((response) => {
          console.log(response.data)
          if (response.result) {
            vm.pointbanks = response.data.pointbanks;
          }
        })
      this.isLoading = false;
    },

    handleSelectionChange(val) {
      // var kl = val.map(function (order) {
      //   return order.id
      // });
      // this.multipleSelection = kl;
      // console.log(this.multipleSelection)
    },
    deleteMargin(margin_id) {
      // let vm = this;
      // this.$store.dispatch("margins/removeMargin_superadmin", margin_id)
      //   .then((resolve) => {
      //     vm.remove_margin(margin_id)
      //   });
    },
    // async updateMarginAmount(margin_id) {
    //
    //   const {value: amount} = await Swal.fire({
    //     icon: "question",
    //     title: 'Enter amount',
    //     input: 'text',
    //     showCancelButton: true,
    //     inputValidator: (value) => {
    //       if (!value) {
    //         return 'You need to write something!'
    //       }
    //     }
    //   })
    //
    //   if (parseInt(amount)) {
    //     let info = {
    //       id: margin_id,
    //       amount: parseInt(amount)
    //     }
    //     this.update_margin_common(info)
    //   }
    // },
    querySearchUser(query) {
      let vm = this;
      vm.userlist = [];
      if (query !== '') {
        this.loading = true;
        axios.$post("/apiauth/login/filter_users/", {keystr: query})
          .then((response) => {
            console.log("response.data.users", response.data.users)
            if (response.result && response.data.users.length>0) {
              this.loading = false;
              vm.userlist = response.data.users
              vm.filters.user_id=""
              return true;
            }
          })
      }
        this.filters.user_id="";
        return false;
    },

    handleSelectUser(item) {
      console.log(item);
    },
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>

<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-sm-6">
              </div>
              <div class="col-sm-6 text-right">

              </div>
              <!-- end col-->
            </div>
            <div class="row">
              <div class="col-md-4">
                有効期限
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label id="UntilFromDate_picker_label">
                    From:
                    <span class="text-danger">*</span>
                  </label>
                  <el-date-picker
                    id="UntilFromDate_picker"
                    v-model="filters.until_at__gte"
                    align="right"
                    type="date"
                    placeholder="開始日選択">
                  </el-date-picker>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label id="UntiletoDate_picker_label">
                    TO:
                    <span class="text-danger">*</span>
                  </label>
                  <el-date-picker
                    id="UntiletoDate_picker"
                    v-model="filters.until_at__lte"
                    align="right"
                    type="date"
                    placeholder="終了日選択">
                  </el-date-picker>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4">
                ユーザー
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <el-select
                    v-model="filters.user_id"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键词"
                    :remote-method="querySearchUser"
                    :loading="loading">
                    <el-option
                      v-for="item in userlist"
                      :key="item.id"
                      :label="item.username"
                      :value="item.id">
                    </el-option>
                  </el-select>
                </div>
              </div>
              <div class="col-md-4">
              </div>
            </div>
            <div class="row">
              <div class="col-12 text-right">

                <b-button variant="primary" v-bind:disabled="isLoading" class="btn-rounded ml-1" @click="load_margins">
                  <b-spinner small v-if="isLoading"></b-spinner>&nbsp;&nbsp;Load Data
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">

            <!-- Table -->
            <div class="table-responsive mb-0">
              <el-table
                :data="pointbanks"
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="expand">
                  <template slot-scope="props">
                    {{ props.row.info }}
                  </template>
                </el-table-column>
                <el-table-column
                  type="selection"
                  width="55">
                </el-table-column>
                <el-table-column label="ID" sortable prop="id">
                  <template slot-scope="scope">
                    {{ '#' + scope.row.id }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="User"
                  sortable
                  prop="user_name">
                  <template slot-scope="scope">
                    {{ scope.row.user_name }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="Point"
                  sortable
                  prop="point">
                  <template slot-scope="scope">{{ scope.row.point|currency("¥") }}</template>
                </el-table-column>
                <el-table-column
                  label="Date"
                  sortable
                  width="160"
                  prop="created_at">
                  <template slot-scope="scope">
                    <span class="text-danger">{{ scope.row.until_at | short_date }}</span> <br>
                    <span >({{ scope.row.created_at | short_date }})</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Action">
                  <template slot-scope="scope">
                    <ul class="list-inline table-action m-0">
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" ><i class="fe-edit-2"></i></a>
<!--                        <a href="javascript:void(0);" @click="updateMarginAmount(scope.row.id)">-->
<!--                          <i class="fe-edit-2"></i>-->
<!--                        </a>-->
                      </li>
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" @click="deleteMargin(scope.row.id)">
                          <i class="fe-trash"></i>
                        </a>
                      </li>
                    </ul>
                  </template>
                </el-table-column>
              </el-table>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
