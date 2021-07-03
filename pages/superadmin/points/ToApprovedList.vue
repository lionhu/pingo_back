<script>
import {mapGetters} from "vuex"
import Swal from "sweetalert2";
import {axios} from '@/plugins/axios.js';

const inputValidOptions = {
  '1': 'Valid',
  '0': 'Invalid'
}
export default {
  name: "toApproved_marginlist",
  components: {
    "el-table": () => import('element-ui/lib/table'),
    "el-table-column": () => import('element-ui/lib/table-column'),
    "el-input": () => import('element-ui/lib/input'),
    "el-select": () => import('element-ui/lib/select'),
    "el-option": () => import('element-ui/lib/option'),
  },
  computed: {
    ...mapGetters({}),
  },
  data() {
    return {
      isLoading: false,
      loading:false,
      marginlist_toBeApproved: [],
      multipleSelection_toBeApproved: [],
      nDays: 30,
      selectUser: null,
      userlist: [],
      filters: {
        is_valid: false,
        is_refound: 1,
        pointbank_saved: false,
        user_id: "name"
      }
    };
  },
  mounted() {
    this.load_margins_toApproved();
  },
  methods: {
    load_margins_toApproved() {
      let vm = this;
      this.isLoading = true;
      vm.marginlist_toBeApproved = [];
      if (this.filters.user_id==="name"){
        delete  this.filters.user_id;
      }else{
        this.filters.user_id=parseInt(this.filters.user_id)
      }
      axios.$post("/back/store/api/margins/list_toApprovedList/", {
        nDays:parseInt(this.nDays),
        filters: this.filters
      }).then((response) => {
        console.log(response.data)
        if (response.result) {
          vm.marginlist_toBeApproved = response.data.margins;
        }
      })
      this.isLoading = false;
    },

    handleSelectionChange_toBeApproved(val) {
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
      let index = vm.marginlist_toBeApproved.findIndex(margin => margin.id === new_margin.id);
      if (index > -1) {
        vm.marginlist_toBeApproved.splice(index, 1, new_margin)
        Swal.fire("Success", "margins has been updated!", "success")
      }
    },
    remove_margin(margin_id) {
      let vm = this;
      let index = vm.marginlist_toBeApproved.findIndex(margin => margin.id === margin_id);
      if (index > -1) {
        vm.marginlist_toBeApproved.splice(index, 1)
        Swal.fire("Success", "margins has been removed!", "success")
      }
    },
    rowSelectable_toBeApproved(row, index) {
      return !!(row.is_refound = 1 && row.pointbank_saved === false)
    },
    querySearchUser(query) {
      let vm = this;
      vm.userlist = [];
      if (query!=="name") {
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
      this.filters.user_id = "";
    },
    handleSelectUser() {
      if (this.filters.user_id) {
        let userIndex = this.userlist.findIndex(user => user.id === this.filters.user_id)
        if (userIndex > -1) {
          this.selectUser = this.userlist[userIndex]
        }
      }
    },

  },
};
</script>

<template>
  <b-tab>
    <template #title>
      <b-spinner type="grow" small class="mr-3 text-warning" v-if="marginlist_toBeApproved.length"></b-spinner>
      <strong>承認待ちポイント</strong>
    </template>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-sm-3">
                <div class="form-group">
                  <el-input v-model="nDays" id="input_nDays_before" placeholder="n Days Before"></el-input>
                </div>
              </div>
              <div class="offset-sm-3 col-sm-6 text-right">
                メンバー：
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
            <div class="row mb-2">
              <div class="col-sm-6 ">
                <b-button variant="success" v-bind:disabled="isLoading" class="btn-rounded ml-1"
                          @click="load_margins_toApproved">
                  <b-spinner small v-if="isLoading"></b-spinner>&nbsp;&nbsp;Load Data
                </b-button>
              </div>
              <div class="col-md-6 text-right">
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
                :data="marginlist_toBeApproved"
                style="width: 100%"
                @selection-change="handleSelectionChange_toBeApproved"
              >
                <el-table-column
                  type="selection"
                  :selectable="rowSelectable_toBeApproved"
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
                  prop="type">
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
