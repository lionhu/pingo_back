<script>
import Swal from "sweetalert2";
import {axios} from '@/plugins/axios.js';

const inputValidOptions = {
  '1': 'Valid',
  '0': 'Invalid'
}
export default {
  name: "marginlist_all",
  components: {
    "el-table": () => import('element-ui/lib/table'),
    "el-table-column": () => import('element-ui/lib/table-column'),
    "el-date-picker": () => import('element-ui/lib/date-picker'),
    "el-select": () => import('element-ui/lib/select'),
    "el-option": () => import('element-ui/lib/option'),
  },
  data() {
    return {
      type_options: [
        {label: "すべて", value: "ALL"},
        {label: "入会賞", value: "INTRODUCE_POINT"},
        {label: '購入取得ボーナス', value: 'OrderBonus'},
        {label: "紹介購入賞", value: "DesendentOrderPoint"},
        {label: "商品購入利用", value: "PURCHASE_ORDER"},
        {label: "贈呈", value: "TRANSFER"},
      ],
      margin_filters: {
        created_at__gte: this.week_before(),
        created_at__lte: new Date().toISOString(),
        type: "ALL",
        user_id: ""
      },
      multipleSelection: [],
      isLoading: false,
      marginlist: [],
      selectUser: null,
      userlist: [],
      loading: false,
    };
  },
  methods: {
    querySearchUser(query) {
      let vm = this;
      vm.userlist = [];
      if (query !== "name") {
        this.loading = true;
        axios.$post("/apiauth/login/filter_users/", {keystr: query})
          .then((response) => {
            if (response.result && response.data.users.length > 0) {
              this.loading = false;
              vm.userlist = response.data.users
              return true;
            }
          })
      }
      return false;
    },
    ResetUserSearch() {
      this.margin_filters.user_id = "";
      this.selectUser=null;
    },
    handleSelectUser() {
      if (this.margin_filters.user_id) {
        let userIndex = this.userlist.findIndex(user => user.id === this.margin_filters.user_id)
        if (userIndex > -1) {
          this.selectUser = this.userlist[userIndex]
        }
      }
    },

    week_before() {
      var dt = new Date();
      return new Date(dt.setDate(dt.getDate() - 7)).toISOString();
    },
    load_margins() {
      let vm = this;
      this.isLoading = true;
      if (this.margin_filters.user_id === "") {
        delete this.margin_filters.user_id;
      } else {
        this.margin_filters.user_id = parseInt(this.margin_filters.user_id)
      }
      axios.$post("/back/store/api/margins/list_filters/", {filters: this.margin_filters})
        .then((response) => {
          console.log(response.data)
          if (response.result) {
            vm.marginlist = response.data.margins;
          }
        })
      this.isLoading = false;
    },
    change_type(margintype) {
      this.margin_filters.type = margintype;
    },

    handleSelectionChange(val) {
      var kl = val.map(function (order) {
        return order.id
      });
      this.multipleSelection = kl;
      console.log(this.multipleSelection)
    },
    deleteMargin(margin_id) {
      let vm = this;
      this.$store.dispatch("margins/removeMargin_superadmin", margin_id)
        .then((resolve) => {
          vm.remove_margin(margin_id)
        });
    },
    async updateMarginValid(margin_id) {
      const {value: validValue} = await Swal.fire({
        title: 'Select Valid',
        input: 'radio',
        inputOptions: inputValidOptions,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to choose something!'
          }
        }
      })

      if (validValue) {
        let info = {
          id: margin_id,
          is_valid: parseInt(validValue)
        }
        this.update_margin_common(info);
      }
    },
    async updateMarginAmount(margin_id) {

      const {value: amount} = await Swal.fire({
        icon: "question",
        title: 'Enter amount',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to write something!'
          }
        }
      })

      if (parseInt(amount)) {
        let info = {
          id: margin_id,
          amount: parseInt(amount)
        }
        this.update_margin_common(info)
      }
    },
    async batch_updateMarginValid() {
      if (this.multipleSelection.length) {
        const {value: validValue} = await Swal.fire({
          title: 'Select Valid',
          input: 'radio',
          inputOptions: inputValidOptions,
          inputValidator: (value) => {
            if (!value) {
              return 'You need to choose something!'
            }
          }
        })

        if (validValue) {
          let info = {
            "margin_ids": this.multipleSelection,
            "update_fields": "is_valid",
            "is_valid": parseInt(validValue)
          }
          this.batchupdate_margin_common(info);
        }
      }
    },

    batchupdate_margin_common(info) {
      let vm = this;
      this.$store.dispatch("margins/batch_updateMargin_superadmin", info)
        .then(resolve => {
          if (resolve.margins.length) {
            resolve.margins.forEach(margin => {
              vm.replace_margin(margin)
            })
          }
        })
    },
    update_margin_common(info) {
      let vm = this;
      this.$store.dispatch("margins/updateMargin_superadmin", info)
        .then(resolve => {
          var new_margin = resolve.margin;
          vm.replace_margin(new_margin)
        })
    },
    replace_margin(new_margin) {
      let vm = this;
      let index = vm.marginlist.findIndex(margin => margin.id === new_margin.id);
      if (index > -1) {
        vm.marginlist.splice(index, 1, new_margin)
        Swal.fire("Success", "margins has been updated!", "success")
      }
    },
    remove_margin(margin_id) {
      let vm = this;
      let index = vm.marginlist.findIndex(margin => margin.id === margin_id);
      if (index > -1) {
        vm.marginlist.splice(index, 1)
        Swal.fire("Success", "margins has been removed!", "success")
      }
    },
    rowSelectable(row, index) {
      return !!(row.is_refound = 1 && row.pointbank_saved === false)
    }
  },
};
</script>

<template>
  <b-tab title="ポイント履歴詳細">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-sm-6">
                <b-dropdown variant="primary" v-model="margin_filters.type">
                  <template v-slot:button-content>
                    Status: {{ margin_filters.type }}
                    <i class="mdi mdi-chevron-down"></i>
                  </template>
                  <b-dropdown-item v-for="option in type_options" :key="option.value"
                                   @click="change_type(option.value)">
                    {{ option.label }}
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <div class="col-sm-6 text-right">
                <el-select
                  v-model="margin_filters.user_id"
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
              <!-- end col-->
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label id="fromDate_picker_label">
                    From:
                    <span class="text-danger">*</span>
                  </label>
                  <el-date-picker
                    id="fromDate_picker"
                    v-model="margin_filters.created_at__gte"
                    align="right"
                    type="date"
                    placeholder="開始日選択">
                  </el-date-picker>
                </div>
              </div>
              <div class="col-md-6 text-right">
                <div class="form-group">
                  <label id="toDate_picker_label">
                    TO:
                    <span class="text-danger">*</span>
                  </label>
                  <el-date-picker
                    id="toDate_picker"
                    v-model="margin_filters.created_at__lte"
                    align="right"
                    type="date"
                    placeholder="終了日選択">
                  </el-date-picker>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">

                <b-button variant="success" v-bind:disabled="isLoading" class="btn-rounded ml-1"
                          @click="load_margins">
                  <b-spinner small v-if="isLoading"></b-spinner>&nbsp;&nbsp;Load Data
                  <span v-if="selectUser!==null">(User: {{selectUser.username}})</span>

                </b-button>
              </div>
              <div class="col-sm-6 text-right">
                <b-dropdown variant="warning">
                  <template v-slot:button-content>
                    Margin Batch Action
                  </template>
                  <b-dropdown-item>
                    <a href="javascript:void(0);" @click="batch_updateMarginValid">Update
                      Valid</a>
                  </b-dropdown-item>
                </b-dropdown>
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
                :data="marginlist"
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  :selectable="rowSelectable"
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
                  prop="user">
                </el-table-column>
                <el-table-column
                  label="Type"
                  sortable
                  prop="type" v-if="margin_filters.type==='ALL'">
                  <template slot-scope="scope">
                    {{ scope.row.type }}
                    <i :class="{'ri-user-voice-fill text-danger':scope.row.info.level==='SUPERADMIN',
                                  'ri-team-fill  text-warning':scope.row.info.level==='CLIENTADMIN',
                                  'ri-user-heart-line  text-primary':scope.row.info.level==='LEVEL_1',
                                  'ri-parent-fill  text-success':scope.row.info.level==='LEVEL_2',
                                  'ri-coin-fill  text-success':scope.row.info.level==='USER_SELF',}"></i>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Amount"
                  sortable
                  prop="amount">
                  <template slot-scope="scope">{{ scope.row.amount|currency("¥") }}</template>
                </el-table-column>
                <el-table-column
                  label="Info">
                  <template slot-scope="scope">
                    <div v-if="scope.row.type=='DesendentOrderPoint'">

                      <i class="far fa-user-circle text-success"></i>&nbsp;&nbsp;{{ scope.row.info.username }} <br>
                      <nuxt-link :to="'/superadmin/orders/' + scope.row.info.order_id" class="action-iconk">
                        <i
                          class="fas fa-shopping-cart"></i>&nbsp;&nbsp;#{{
                          scope.row.info.order_id
                        }}-{{ scope.row.info.orderitem_id }}
                      </nuxt-link>
                    </div>


                    <div v-if="scope.row.type=='OrderBonus'">
                      <nuxt-link :to="'/superadmin/orders/' + scope.row.info.order_id" class="action-iconk">
                        <i
                          class="fas fa-shopping-cart"></i>&nbsp;&nbsp;#{{
                          scope.row.info.order_id
                        }}-{{ scope.row.info.orderitem_id }}
                      </nuxt-link>
                    </div>

                    <div v-if="scope.row.type=='PURCHASE_ORDER'">
                      <nuxt-link :to="'/superadmin/orders/' + scope.row.info.order_id" class="action-iconk">
                        <i class="ri-shopping-basket-2-fill"></i>&nbsp;&nbsp;#{{ scope.row.info.order_id }}
                      </nuxt-link>
                    </div>


                    <div v-if="scope.row.type=='INTRODUCE_POINT'">
                      <i class="fas fa-street-view"></i>&nbsp;&nbsp;{{ scope.row.info.username }}
                    </div>

                    <div v-if="scope.row.type=='TRANSFER_IN'">
                      <i class="ri-gift-fill text-warning"></i>&nbsp;&nbsp;{{ scope.row.info.username }}
                    </div>
                    <div v-if="scope.row.type=='TRANSFER_OUT'">
                      <i class="ri-hand-heart-fill text-success"></i>&nbsp;&nbsp;{{ scope.row.info.username }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Date"
                  sortable
                  width="100"
                  prop="created_at">
                  <template slot-scope="scope">
                    {{ scope.row.created_at | short_datetime }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="Valid"
                  sortable
                  width="80"
                  align="center"
                  prop="is_valid">
                  <template slot-scope="scope">

                    <a href="javascript:void(0);" @click="updateMarginValid(scope.row.id)"
                       v-if="!scope.row.is_valid">
                      <i class="fe-eye-off text-danger"></i>
                    </a>
                    <a href="javascript:void(0);" v-else>
                      <i class="fe-eye text-success"></i>
                    </a>
                  </template>
                </el-table-column>

                <el-table-column
                  label="Action">
                  <template slot-scope="scope">
                    <ul class="list-inline table-action m-0">
                      <li class="list-inline-item" v-if="!scope.row.is_valid">
                        <a href="javascript:void(0);" @click="updateMarginAmount(scope.row.id)">
                          <i class="fe-edit-2"></i>
                        </a>
                      </li>
                      <li class="list-inline-item" v-if="!scope.row.is_valid">
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
  </b-tab>
</template>
