<script>
import {mapGetters} from "vuex"
import {swalService} from "@/helpers/fakebackend/swal.service";

export default {
  name: "vendor_orderlist",
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
    DeliveryModal: () => import("../widgets/modal_delivery"),
    PayOrderItemModal: () => import("../widgets/modal_payOrderItemVendor"),
  },
  data() {
    return {
      title: "Vendor Orderlist",
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
        {label: "PROCESSING", value: "PROCESSING"},
        {label: "FINISHED", value: "FINISHED"}
      ],
      orderfilter: {
        order__ordered_date__gte: this.week_before(),
        order__ordered_date__lte: new Date().toISOString(),
        status: "PROCESSING",
      },
      isLoading: false,
      multipleSelection: [],
      showmodel_payvendor: false,
      orderitems: [],
      edit_orderitem: {},
      order_id: 0,
      showmodel_delivery: false,
      vendors: []
    };
  },
  // watch: {
  //   orderitems: (newval, oldVal) => {
  //     console.log("oldVal", oldVal)
  //     console.log("newval", newval)
  //     if (newval.length) {
  //       let _vendors = newval.map((orderitem) => {
  //         return orderitem.item.vendor.name;
  //       })
  //       let unique_vendors = [...new Set(_vendors)];
  //       console.log(unique_vendors)
  //       this.vendors = unique_vendors;
  //     }
  //   }
  // },
  methods: {
    week_before() {
      var dt = new Date();
      return new Date(dt.setDate(dt.getDate() - 7)).toISOString();
    },
    change_status(status) {
      this.orderfilter.status = status;
    },
    load_orders() {
      let vm = this;
      this.$store.dispatch("orders/getSuperadminFilteredOrderitemList", this.orderfilter)
        .then(orderitems => {
          vm.orderitems = orderitems;
        })
    },

    showDeliveryModal(orderitem) {
      this.edit_orderitem = orderitem;
      this.order_id = orderitem.order_id;
      this.showmodel_delivery = !this.showmodel_delivery
    },
    showPayModal(orderitem) {
      this.showmodel_payvendor = !this.showmodel_payvendor
    },
    UpdateOrderItemResult({result, order, orderitems}) {
      let _orderitem = orderitems.find(orderitem => orderitem.id === this.edit_orderitem.id);
      if (result && _orderitem) {
        let itemIndex = this.orderitems.findIndex(orderitem => orderitem.id === this.edit_orderitem.id)
        if (itemIndex > -1) {
          this.orderitems.splice(itemIndex, 1, _orderitem)
          swalService.showToast("success", `item #${this.edit_orderitem.id} has been updated!`)
        }
      }
    },
    batch_updatePayment() {
      if (this.multipleSelection.length) {
        console.log(this.multipleSelection)

        this.showmodel_payvendor = true;
      }
    },
    single_updatePayment(orderitem_id) {
      this.multipleSelection = [];
      this.multipleSelection.push(orderitem_id);
      this.showmodel_payvendor = true;
    },
    UpdateOrderItems(res) {
      var itemIndex = -1;
      res.orderitems.forEach(_orderitem => {
        itemIndex = this.orderitems.findIndex(item => item.id === _orderitem.id)
        if (itemIndex > -1) {
          console.log(`orderitem ${_orderitem.id}, index: ${itemIndex}`)
          this.orderitems.splice(itemIndex, 1, _orderitem)
        }
      })
    },
    handleSelectionChange(val) {
      var kl = val.map(function (orderitem) {
        return orderitem.id
      });
      this.multipleSelection = kl;
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
                    {{
                      item.label
                    }}
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <div class="col-sm-6 text-right">
                <b-dropdown variant="warning">
                  <template v-slot:button-content>
                    OrderItem Batch Action
                  </template>
                  <b-dropdown-item>
                    <a href="javascript:void(0);" v-b-modal.modal-payvendor @click="batch_updatePayment">Update
                      Payment</a>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>
            <div class="row mb-2">
              <div class="col-md-6">
                <div class="form-group">
                  <label id="fromDate_picker_label">
                    From:
                    <span class="text-danger">*</span>
                  </label>
                  <el-date-picker
                    id="fromDate_picker"
                    v-model="orderfilter.order__ordered_date__gte"
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
                    v-model="orderfilter.order__ordered_date__lte"
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
                :data="orderitems"
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="55">
                </el-table-column>
                <el-table-column label="ID" sortable prop="id">
                  <template slot-scope="scope">
                    {{ '#' + scope.row.id }} <br>
                    <nuxt-link :to="'/superadmin/orders/' + scope.row.order_id" class="action-iconk">
                      <b-badge variant="primary" pill v-if="scope.row.order_type==='REGULAR'">R (#{{
                          scope.row.order_id
                        }})
                      </b-badge>
                      <b-badge variant="warning" pill v-else>P(#{{ scope.row.order_id }})</b-badge>
                    </nuxt-link>
                  </template>
                </el-table-column>
                <el-table-column
                  label="User"
                  sortable
                  prop="user">
                </el-table-column>
                <el-table-column
                  label="Vendor"
                  sortable
                  prop="item.vendor.name">
                </el-table-column>
                <el-table-column
                  label="Date"
                  sortable
                  prop="order_date">
                  <template slot-scope="scope">
                    {{ scope.row.order_date|short_date }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="Total"
                  align="right"
                  sortable>
                  <template slot-scope="scope">
                    {{ scope.row.quantity * scope.row.variant.purchase_price | currency("¥") }}
                  </template>
                </el-table-column>

                <el-table-column
                  label="Paid"
                  width="65"
                >
                  <template slot-scope="scope">
                    <a href="javascript:void(0);" v-b-modal.modal-payvendor @click="single_updatePayment(scope.row.id)">
                      <span class="badge badge-soft-danger text-danger" v-if="!scope.row.paid">
                        <i class="fe-home font-16"></i>
                      </span>
                      <span class="badge badge-soft-success text-success" v-else>
                        <i class="fe-home font-16"></i>
                      </span>
                    </a>

                  </template>
                </el-table-column>
                <el-table-column
                  label="Deli"
                  width="65"
                >
                  <template slot-scope="scope">
                    <a href="javascript:void(0);" v-b-modal.modal-delivery class="card-link text-custom"
                       @click="showDeliveryModal(scope.row)">
                      <span class="badge badge-soft-danger text-danger" v-if="!scope.row.delivered">
                        <i class="fe-truck font-16"></i>
                      </span>
                      <span class="badge badge-soft-success text-success" v-else>
                        <i class="fe-truck font-16"></i>
                      </span>
                    </a>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Status"
                  sortable
                  prop="status">
                  <template slot-scope="scope">
                    <!--                    <a href="javascript:void(0);" @click="updateOrderStatus(scope.row.id)">-->
                    <span class="badge"
                          :class="{'badge-soft-danger': scope.row.status === 'NEW',
                          'badge-soft-success': scope.row.status === 'FINISHED'}">
                      {{ scope.row.status }}
                    </span>
                    <!--                    </a>-->
                  </template>
                </el-table-column>
              </el-table>

            </div>
          </div>
        </div>
      </div>
    </div>
    <PayOrderItemModal :orderitem_ids="multipleSelection"
                       openPayOrderItemModal="showmodel_payvendor" @updateResult="UpdateOrderItems"></PayOrderItemModal>
    <DeliveryModal :openDeliveryModal="showmodel_delivery" :order_id="order_id"
                   :orderitem="edit_orderitem" @updateResult="UpdateOrderItemResult"></DeliveryModal>
  </div>
</template>
