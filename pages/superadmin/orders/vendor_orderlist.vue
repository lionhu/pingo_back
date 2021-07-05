<script src="../../../helpers/fakebackend/order.service.js"></script>
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
    "el-select": () => import('element-ui/lib/select'),
    "el-option": () => import('element-ui/lib/option'),
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
        item__vendor_id: ""
      },
      isLoading: false,
      multipleSelection: [],
      showmodel_payvendor: false,
      orderitems: [],
      edit_orderitem: {},
      order_id: 0,
      showmodel_delivery: false,
      vendors: [],
    };
  },
  computed: {
    ...mapGetters({
      VendorList: "system/getterVendorList"
    }),
    vendor_options() {
      if (this.VendorList.length) {
        let vendor_select_options = this.VendorList.map(vendor => {
          return {label: vendor.name, value: vendor.id}
        })
        return vendor_select_options;
      }
      return []
    }
  },
  mounted() {
    this.orderfilter.item__vendor_id="";
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
      let vm = this;
      if (this.orderfilter.status === "ALL") delete this.orderfilter.status;
      if (this.orderfilter.item__vendor_id === "") delete this.orderfilter.item__vendor_id;
      console.log(this.orderfilter)
      this.$store.dispatch("orders/get_vendor_filtered_rrderitem_list", this.orderfilter)
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
              <div class="col-sm-6">
                <label for="vendor_selector">ベンダー選択：</label>
                <el-select id="vendor_selector" v-model="orderfilter.item__vendor_id" placeholder="请选择">
                  <el-option
                    v-for="vendor in vendor_options"
                    :key="vendor.value"
                    :label="vendor.label"
                    :value="vendor.value">
                  </el-option>
                </el-select>
              </div>
              <div class="col-6 text-right">
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

                <el-table-column type="expand">
                  <template slot-scope="props">
                    <div class="row">
                      <div class="col-lg-8">
                        <div>
                          <div class="table-responsive">
                            <h5 class="font-15 mb-2">注文詳細</h5>
                            <table class="table table-centered border table-nowrap mb-lg-0">
                              <thead class="bg-light">
                              <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                              </tr>
                              </thead>
                              <tbody>
                              <tr>
                                <td>
                                  <div class="media align-items-center">
                                    <div class="mr-3">
                                      <img :src="props.row.variant.thumbimage" alt="product-img" height="40"/>
                                    </div>
                                    <div class="media-body">
                                      <h6 class="m-0">{{ props.row.item.item_name }}</h6>
                                      <p class="mb-0">
                                        {{ props.row.variant.name }} <br>
                                        (SKU: {{ props.row.variant.sku}})
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td>{{ props.row.quantity }}</td>
                                <td>{{ props.row.variant.purchase_price |currency("¥")}}</td>
                                <td>{{ props.row.total_purchase_price  |currency("¥")}}</td>
                              </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                        <div class="col-lg-4">
                          <div>
                            <h5 class="font-15 mb-2">支払情報</h5>

                            <div class="card p-2 mb-lg-0">
                              <table class="table table-borderless table-sm mb-0">
                                <tbody>
                                <tr>
                                  <th scope="row">支払状態:</th>
                                  <td>
                                    <i :class="{'ri-checkbox-circle-fill text-success':props.row.paid,'ri-close-circle-fill text-danger':!props.row.paid}"></i>
                                  </td>
                                </tr>
                                <tr v-if="props.row.paid">
                                  <th scope="row">支払日 :</th>
                                  <td>{{props.row.paid_at}}</td>
                                </tr>
                                <tr v-if="props.row.paid">
                                  <th scope="row">詳細:</th>
                                  <td>{{props.row.paid_info}}</td>
                                </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                    </div>
                      <div class="row mb-3">
                        <div class="col-lg-6">
                          <div>
                            <h5 class="font-15 mb-2">送付先</h5>

                            <div class="card p-2 mb-lg-0">
                              <table class="table table-borderless table-sm mb-0">
                                <tbody>
                                <tr>
                                  <th colspan="2">
                                    <h5 class="font-15 m-0">{{ props.row.json_shippingaddress.name }}</h5>
                                  </th>
                                </tr>
                                <tr>
                                  <th scope="row">Address:</th>
                                  <td>〒{{
                                      props.row.json_shippingaddress.postcode
                                    }}{{ props.row.json_shippingaddress.state }}
                                    {{ props.row.json_shippingaddress.city }}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row"></th>
                                  <td>〒{{
                                      props.row.json_shippingaddress.town
                                    }}{{ props.row.json_shippingaddress.address_1 }}
                                    {{ props.row.json_shippingaddress.address_2 }}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Phone :</th>
                                  <td>{{ props.row.json_shippingaddress.phone }}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Email :</th>
                                  <td>{{ props.row.json_shippingaddress.email }}</td>
                                </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div class="col-lg-6">
                          <div>
                            <h5 class="font-15 mb-2">配送情報</h5>

                            <div class="card p-2 mb-lg-0">
                              <div class="text-center">
                                <div class="my-2">
                                  <i class="mdi mdi-truck-fast h1 text-muted"></i>
                                </div>
                                <h5><b>UPS Delivery</b></h5>
                                <div class="mt-2 pt-1">
                                  <p class="mb-1">
                                    <span class="font-weight-semibold">Order ID :</span>
                                    xxxx048
                                  </p>
                                  <p class="mb-0">
                                    <span class="font-weight-semibold">Payment Mode :</span>
                                    COD
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </template>
                </el-table-column>

                <el-table-column label="ID" sortable prop="id">
                  <template slot-scope="scope">
                    #_{{ scope.row.id }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="Vendor"
                  sortable
                  prop="item.vendor.name"  v-if="Object.keys(orderfilter).indexOf('item__vendor_id') === -1">
                  <template slot-scope="scope">
                    {{ scope.row.item.vendor.name }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="顧客"
                  sortable
                  prop="json_shippingaddress.name">
                  <template slot-scope="scope">
                    {{ scope.row.json_shippingaddress.name }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="ユーザー"
                  sortable
                  prop="user">
                </el-table-column>
                <el-table-column
                  label="Date"
                  sortable
                  prop="order_date">
                  <template slot-scope="scope">
                    {{ scope.row.ordered_date|short_date }}
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
