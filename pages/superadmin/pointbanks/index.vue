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
    "countTo":()=>import('vue-count-to'),
    "el-table": () => import('element-ui/lib/table'),
    "el-table-column": () => import('element-ui/lib/table-column'),
    "el-date-picker": () => import('element-ui/lib/date-picker'),
    "el-autocomplete": () => import('element-ui/lib/autocomplete'),
    "el-select": () => import('element-ui/lib/select'),
    "el-option": () => import('element-ui/lib/option'),
  },
  computed: {
    total(){
      if(this.pointbanks.length===0) return 0;
      return this.pointbanks.reduce( (accumulator, val) => {
        console.log(parseInt(val.point))
         accumulator += parseInt(val.point)
        return accumulator
      },0)
      // return this.pointbanks.reduce( (accumulator, val) => accumulator + parseInt(val.point))
    }
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
      selectUser: null,
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
    load_pointbanks() {
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
    querySearchUser(query) {
      let vm = this;
      vm.userlist = [];
      if (query.length>2) {
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
ResetUserSearch(){
      this.filters.user_id="";
},
    handleSelectUser(item) {
      console.log(item);
      var userIndex=this.userlist.findIndex(user=>user.id ==item);
      console.log(userIndex)
      if (userIndex>-1){
        this.selectUser=this.userlist[userIndex];
      }
    },
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>

<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-md-4 col-xs-12">
        <div class="widget-rounded-circle card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-6">
                            <div class="avatar-lg rounded-circle bg-icon-primary">
                                <i class="ri-coin-fill font-24 avatar-title text-white"></i>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-right">
                                <h3 class="text-dark mt-1">
                                    <span>
                                        <countTo :end-val="total" :duration="1500"></countTo>
                                    </span>
                                </h3>
                                <p class="text-muted mb-1 text-truncate">Total Points</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div></div>
      <div class="col-md-4 col-xs-12">
        <div class="widget-rounded-circle card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-6">
                            <div class="avatar-lg rounded-circle bg-icon-success">
                                <i class="ri-auction-fill font-24 avatar-title text-white"></i>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-right">
                                <h3 class="text-dark mt-1">
                                    <span>
                                        <countTo :end-val="pointbanks.length" :duration="1500"></countTo>
                                    </span>
                                </h3>
                                <p class="text-muted mb-1 text-truncate">{{pointbanks.length}} records</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      </div>
      <div class="col-md-4 col-xs-12" v-if="selectUser!==null">
        <div class="widget-rounded-circle card">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-auto">
                            <div class="avatar-lg">
                              <div class="avatar-lg rounded-circle bg-icon-warning">
                                <img :src="`https://www.pingo.jp/mediafiles/${selectUser.avatar}`"
                                     style="max-width: 60px;border-radius:100%;"
                                     v-if="selectUser.avatar!==null">
                                <i class="ri-map-pin-user-fill font-24 avatar-title text-white" v-else></i>
                            </div>
                            </div>
                        </div>
                        <div class="col">
                            <h5 class="mt-0">{{selectUser.username}}</h5>
                            <p class="text-muted mb-1 font-13">{{selectUser.email}}</p>
<!--                            <small class="text-muted">-->
<!--                                <b>user.type</b>-->
<!--                            </small>-->
                        </div>
                    </div>
                </div>
                <!-- end row-->
            </div>
      </div>
    </div>
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
                    @change="handleSelectUser"
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
                  <b-button variant="primary" @click="ResetUserSearch">Reset</b-button>
                </div>
              </div>
              <div class="col-md-4">
              </div>
            </div>
            <div class="row">
              <div class="col-12 text-right">

                <b-button variant="primary" v-bind:disabled="isLoading" class="btn-rounded ml-1" @click="load_pointbanks">
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
              </el-table>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
