<script>
import {mapGetters} from "vuex"
import Swal from "sweetalert2";

export default {
  name: "order_detail",
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
    UpdatePaymentModal: () => import("../widgets/modalUpdatePayment"),
  },
  data() {
    return {
      title: "Orders",
      items: [
        {
          text: "Minton"
        },
        {
          text: "eCommerce"
        },
        {
          text: "Orders",
          active: true
        }
      ],
      status_options: [
        {label: "すべて", value: "ALL"},
        {label: "NEW", value: "NEW"},
        {label: "FINISHED", value: "FINISHED"}
      ],
      orderfilter: {
        ordered_date__gte: this.week_before(),
        ordered_date__lte: new Date().toISOString(),
        status: "NEW",
      },
      isLoading: false,
      multipleSelection: [],
      showmodel_payvendor: false,
      showmodal_payment_status: false,
      showmodal_vendor_payment: false,
      order_type: ""
    };
  },
  watch: {
    order_type: (oldvalue, newvalue) => {
      console.log(newvalue)
    }
  },
  computed: {
    ...mapGetters({
      "orders": "orders/gettersSuperadminOrderList"
    }),
  },
  methods: {
    week_before() {
      var dt = new Date();
      return new Date(dt.setDate(dt.getDate() - 7)).toISOString();
    },
    change_status(status) {
      this.orderfilter.status = status;
    },
    load_orders() {
      this.$store.dispatch("orders/load_filteredlist_superadmin", this.orderfilter)
    },
    removeOrder(order_id) {
      this.$store.dispatch("orders/removeOrder_superadmin", order_id);
    },
    updateOrder(order_id, info) {
      console.log(info);
    },
    batch_updateOrderStatus() {
      var selected_num = this.multipleSelection.length;
      if (selected_num > 0) {
        this.$store.dispatch("orders/updateOrderStatus_superadmin", this.multipleSelection)
      } else {
        Swal.fire("Warning", "you have to choose more than one", "warning")
      }
    },
    batch_payVendor() {
      var selected_num = this.multipleSelection.length;
      if (selected_num > 0) {
        this.showmodel_payvendor = !this.showmodel_payvendor;
      } else {
        this.showmodel_payvendor = false;
        Swal.fire("Warning", "you have to choose more than one", "warning")
      }
    },
    batch_RemoveOrders() {
      var selected_num = this.multipleSelection.length;
      if (selected_num > 0) {
        this.$store.dispatch("orders/batch_removeOrders_superadmin", this.multipleSelection)
      } else {
        Swal.fire("Warning", "you have to choose more than one", "warning")
      }
    },
    handleSelectionChange(val) {
      var kl = val.map(function (order) {
        return order.id
      });
      this.multipleSelection = kl;
    },
    isOrderPaid(order) {
      var result = true;
      if (order.orderitems && order.orderitems.length) {
        for (let item of order.orderitems) {
          if (!item.paid) {
            result = false;
            break;
          }
        }
      }
      return result;
    },
    isOrderDelivered(order) {
      var result = true;
      if (order.orderitems && order.orderitems.length) {
        for (let item of order.orderitems) {
          if (!item.delivered) {
            result = false;
            break;
          }
        }
      }
      return result;
    },
    update_order_payment_status(mode, ids) {
      var order_ids = [];
      if (mode === "single") {
        order_ids.push(ids);
        this.multipleSelection = order_ids;
      }
      console.log("update_order_payment_status order_ids", this.multipleSelection)
      this.showmodal_payment_status = true;
    },
    update_order_payment_status_result(info) {
      if (info.result) {
        this.showmodal_payment_status = false;
      } else {
        this.showmodal_payment_status = false;
      }
    },
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>
<style>
.font-16 {
  font-size: 1.5rem;
}
</style>
<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-sm-6">
                <b-dropdown variant="primary" v-model="orderfilter.status">
                  <template v-slot:button-content>
                    Status: {{ orderfilter.status }}
                    <i class="mdi mdi-chevron-down"></i>
                  </template>
                  <b-dropdown-item v-for="item in status_options" :key="item.value" @click="change_status(item.value)">
                    {{item.label}}
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <div class="col-sm-6 text-right">
                <b-dropdown variant="warning" v-model="orderfilter.status">
                  <template v-slot:button-content>
                    Order Batch Action
                    <i class="mdi mdi-chevron-down"></i>
                  </template>
                  <b-dropdown-item>
                    <a href="javascript:void(0);" v-b-modal:modal-update-payment
                       @click="update_order_payment_status('multiple',null)">Update Order Payment Status</a>
                  </b-dropdown-item>
                  <b-dropdown-item>
                    <a href="javascript:void(0);" v-b-modal.modal-payvendor @click="batch_payVendor">VendorPay
                      Selected</a>
                  </b-dropdown-item>
                  <b-dropdown-item>
                    <a href="javascript:void(0);" @click="batch_updateOrderStatus">Update Status</a>
                  </b-dropdown-item>
                  <b-dropdown-item>
                    <a href="javascript:void(0);" @click="batch_RemoveOrders"><i class="fe-trash-2 text-danger"></i>
                      Remove Orders</a>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-md-6">
                <div class="form-group">
                  <label id="fromDate_picker_label">
                    From:<span class="text-danger">*</span>
                  </label>
                  <el-date-picker
                    id="fromDate_picker"
                    v-model="orderfilter.ordered_date__gte"
                    align="right"
                    type="date"
                    placeholder="開始日選択">
                  </el-date-picker>
                </div>
              </div>
              <div class="col-md-6 text-right">
                <div class="form-group">
                  <label id="toDate_picker_label">
                    TO:<span class="text-danger">*</span>
                  </label>
                  <el-date-picker
                    id="toDate_picker"
                    v-model="orderfilter.ordered_date__lte"
                    align="right"
                    type="date"
                    placeholder="開始日選択">
                  </el-date-picker>
                </div>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-12 text-right">
                <b-button variant="primary" v-bind:disabled="isLoading" class="btn-rounded ml-1"
                          @click="load_orders">
                  <b-spinner small v-if="isLoading"></b-spinner>&nbsp;&nbsp;Load Data
                </b-button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="table-responsive mb-0">
              <el-table
                :data="orders"
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="30">
                </el-table-column>

                <el-table-column type="expand">
                  <template slot-scope="props">
                    <div v-if="props.row.message!==''">
                      <h4>Message</h4>
                      <blockquote class="blockquote">
                        <p class="mb-0">{{ props.row.message }}</p>
                        <footer class="blockquote-footer">
                          From <cite title="Source Title">{{ props.row.user }}</cite>
                        </footer>
                      </blockquote>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="ID" sortable prop="id">
                  <template slot-scope="scope">
                    {{ '#' + scope.row.id }}<i class=" ri-message-2-fill text-danger" v-if="scope.row.message!==''"></i>
                    <br>
                    <b-badge variant="primary" pill>{{ scope.row.status }}</b-badge>
                  </template>
                </el-table-column>
                <el-table-column
                  label="User"
                  sortable
                  width="100"
                  prop="user">
                </el-table-column>
                <el-table-column
                  label="Date"
                  sortable
                  width="100"
                  prop="ordered_date">
                  <template slot-scope="scope">
                    {{ scope.row.ordered_date | short_date }}
                  </template>
                </el-table-column>
                <el-table-column label="Total" sortable prop="TaxedTotal">
                  <template slot-scope="scope">
                    {{ scope.row.Total | currency("¥") }}
                  </template>
                </el-table-column>
                <el-table-column label="顧客">
                  <template slot-scope="scope">
                    <a href="javascript:void(0)" v-b-modal:modal-update-payment
                       @click="update_order_payment_status('single',scope.row.id)"
                       v-if="scope.row.payment_status==='APPROVED'">
                      <b-badge variant="warning" class="text-white" pill v-if="scope.row.payment_status==='APPROVED'">
                        APPROVED
                      </b-badge>
                    </a>
                    <b-badge variant="success" class="text-white" pill v-if="scope.row.payment_status==='COMPLETED'">
                      COMPLETED
                    </b-badge>
                    <b-badge variant="danger" class="text-white" pill v-if="scope.row.payment_status==='CANCELED'">
                      CANCELED
                    </b-badge>
                  </template>
                </el-table-column>
                <el-table-column label="ベンダー">
                  <template slot-scope="scope">
                      <b-badge variant="danger" class="text-white" pill v-if="!isOrderPaid(scope.row)">Unpaid</b-badge>
                      <b-badge variant="success" class="text-white" pill v-else>Paid</b-badge>
                  </template>
                </el-table-column>
                <el-table-column label="配送">
                  <template slot-scope="scope">
                    <span class="badge badge-soft-danger text-danger" v-if="!isOrderDelivered(scope.row)">
                        <i class="fe-truck font-16"></i>
                      </span>
                    <span class="badge badge-soft-success text-primary" v-else>
                        <i class="fe-truck font-16"></i>
                      </span>
                    <!--                    </a>-->
                  </template>
                </el-table-column>
                <el-table-column
                  label="Action">
                  <template slot-scope="scope">
                    <ul class="list-inline table-action m-0">
                      <li class="list-inline-item">
                        <nuxt-link :to="'/superadmin/orders/' + scope.row.id" class="action-icon text-success">
                          <i class="fe-edit"></i></nuxt-link>

                      </li>
                      <li class="list-inline-item" v-if="!scope.row.is_paid">
                        <a href="javascript:void(0);" class="action-icon text-danger"
                           @click="removeOrder(scope.row.id)">
                          <i class="fe-trash"></i></a>
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
    <UpdatePaymentModal :openModal="showmodal_payment_status" :order_ids="multipleSelection"
                        @updateResult="update_order_payment_status_result"></UpdatePaymentModal>
  </div>
</template>
