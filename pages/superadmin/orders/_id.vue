<script>
import {mapGetters} from "vuex";
import {axios} from "@/plugins/axios";
import Swal from 'sweetalert2'
import {swalService} from "@/helpers/fakebackend/swal.service";

export default {
  name: "order_detail",
  head() {
    return {
      title: `${this.title} | Pingo - Order`,
      script: [
        {src: 'https://unpkg.com/element-ui/lib/index.js'}
      ],
      link: [
        {rel: 'stylesheet', href: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'},
      ]
    };
  },
  components: {
    DeliveryModal: () => import("../widgets/modal_delivery"),
    "el-table": () => import('element-ui/lib/table'),
    "el-table-column": () => import('element-ui/lib/table-column'),
  },
  async asyncData({params}) {
    if (parseInt(params.id) > 0) {
      let url = `/back/store/api/orders_superadmin/${params.id}/`
      let orderDetail = await axios.get(url).then((response) => {
        if (response.data.result) {
          return orderDetail = response.data.data
        } else {
          window.location.href = "/superadmin/ecommerce/orders"
        }
      })
      return orderDetail
    }
    window.location.href = "/superadmin/ecommerce/orders"
  },
  data() {
    return {
      title: "Order Detail",
      items: [
        {
          text: "WAVUS"
        },
        {
          text: "eCommerce"
        },
        {
          text: "Order Detail",
          active: true
        }
      ],
      showmodel_delivery: false,
      edit_orderitem: {}
    };
  },
  middleware: ['router-auth', 'router-superadmin'],
  computed: {
    ...mapGetters({
      // "order": "orders/gettersSuperadminOrder"
    }),
    backend_server() {
      return this.$store.state.system.backend_server
    },
    card_payment() {
      return JSON.parse(this.order.payment_info)
    },
    total_margin() {
      return this.board_margins.reduce((prev, current) => prev + current.amount, 0)
    },
    profit() {
      var order_use_point = this.order.point_usage.apply_point ? this.order.point_usage.use_point : 0;
      return this.order.Total - this.order.TotalPurchasePrice - this.total_margin - order_use_point;
    },
    board_margins() {
      return this.margins.filter(margin => parseInt(margin.info.orderitem_id))
    },
    pointUSE() {
      return this.order.point_usage
      return JSON.parse(this.order.point_usage);
    }
  },
  mounted() {
    this.load_order(this.$route.params.id)
  },
  methods: {
    load_order(order_id) {
      this.$store.dispatch("orders/load_order", order_id)
    },
    getImageUrl(path) {
      return this.backend_server + path
    },
    updateOrderItemStatus(orderitem_id) {
      var updateinfo = {
        "order_id": this.order.id,
        "id": orderitem_id
      }
      this.$store.dispatch("orders/updateOrderItemStatus_superadmin", updateinfo);
    },
    showDeliveryModal(orderitem) {
      this.edit_orderitem = orderitem
      this.showmodel_delivery = true
    },
    UpdateOrderItem(response) {
      console.log("UpdateOrderItem", response)

      if (response.result) {
        let newItem = response.orderitems[0];
        let itemIndex = this.order.orderitems.findIndex(item => item.id == newItem.id)
        if (itemIndex > -1) {
          this.order.orderitems.splice(itemIndex, 1, newItem)
          swalService.showToast("success", `Item #${newItem.id} delivery info has beedn updated!`)
        }
      }
      // this.order=result.order
    },
    deleteMargin(margin_id) {
      let vm = this;
      this.$store.dispatch("margins/removeMargin_superadmin", margin_id)
        .then((resolve) => {
          let index = vm.margins.findIndex(margin => margin.id === margin_id);
          if (index > -1) {
            vm.margins.splice(index, 1)
          }
        });
    },
    async updateMargin(margin_id) {
      let vm = this;
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
        this.$store.dispatch("margins/updateMargin_superadmin", info)
          .then(resolve => {
            var new_margin = resolve.margin;
            let index = vm.margins.findIndex(margin => margin.id === margin_id);
            if (index > -1) {
              vm.margins.splice(index, 1, new_margin)
            }
          })
      }
    },
    updateMargin_valid(margin_id, valid_flag) {
      let vm = this;
      let info = {
        id: margin_id,
        is_valid: valid_flag
      }
      this.$store.dispatch("margins/updateMargin_superadmin", info)
        .then(resolve => {
          var new_margin = resolve.margin;
          let index = vm.margins.findIndex(margin => margin.id === margin_id);
          if (index > -1) {
            vm.margins.splice(index, 1, new_margin)
            swalService.showToast("success", `margin_id ${margin_id} new status ${new_margin.is_valid}`)
          }
        })
    },
  }

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
      <div class="col-lg-12">
        <div class="card">
          <div class="card-header border-bottom bg-transparent">
            <h5 class="header-title mb-0">Order #{{ order.id }}
              <span class="ml-md-3 badge"
                    :class="{'badge-soft-danger': order.status === 'NEW',
                          'badge-soft-success': order.status === 'FINISHED'}">
                      {{ order.status }}
            </span>
            </h5>
          </div>
          <div class="card-body">
            <div>

              <h5 v-if="order.message!==''">Message from Customer: </h5>
              <b-alert show dismissible class="bg-danger text-white border-0 mb-2" v-if="order.message!==''">
                {{ order.message }}
              </b-alert>
              <div class="row">
                <div class="col-lg-3 col-sm-6">
                  <div class="media mb-2">
                    <div class="mr-2 align-self-center">
                      <i class="ri-hashtag h2 m-0 text-muted"></i>
                    </div>
                    <div class="media-body">
                      <p class="mb-1">注文番号No.</p>
                      <h5 class="mt-0">
                        #{{ order.id }}
                      </h5>
                    </div>
                  </div>
                </div>
                <div class="col-lg-3 col-sm-6">
                  <div class="media mb-2">
                    <div class="mr-2 align-self-center">
                      <i class="ri-user-2-line h2 m-0 text-muted"></i>
                    </div>
                    <div class="media-body">
                      <p class="mb-1">ユーザー</p>
                      <h5 class="mt-0">
                        {{ order.user }}
                      </h5>
                    </div>
                  </div>
                </div>
                <div class="col-lg-3 col-sm-6">
                  <div class="media mb-2">
                    <div class="mr-2 align-self-center">
                      <i class="ri-calendar-event-line h2 m-0 text-muted"></i>
                    </div>
                    <div class="media-body">
                      <p class="mb-1">日付</p>
                      <h5 class="mt-0">
                        {{ order.ordered_date |short_date }} <small
                        class="text-muted">{{ order.ordered_date|short_time }}</small>
                      </h5>
                    </div>
                  </div>
                </div>
                <div class="col-lg-3 col-sm-6">
                  <div class="media mb-2">
                    <div class="mr-2 align-self-center">
                      <i class="fe-git-merge h2 m-0 text-muted"></i>
                    </div>
                    <div class="media-body">
                      <p class="mb-1">ポイント付与</p>
                      <h5 class="mt-0">
                        {{ total_margin|currency("¥") }}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-2">
              <h4 class="header-title mb-3">注文商品一覧 #{{ order.id }}</h4>
              <div class="row">
                <div class="col-12">
                  <div>
                    <div class="table-responsive">
                      <el-table
                        class="table table-centered border table-nowrap mb-lg-0"
                        :data="order.orderitems"
                        style="width: 100%">
                        <el-table-column type="expand">
                          <template slot-scope="props">
                            <div class="row mb-3">
                              <div class="col-lg-6">

                              <div class="media-body">
                                <h5 class="m-0">商品名：</h5>
                                <p class="mb-0">{{ props.row.item.item_name }}(#{{ props.row.id }})</p>
                              </div>

                              </div>
                              <div class="col-lg-6">

                                <div>
                                  <h4 class="font-15 mb-2">配送情報</h4>

                                  <div class="card p-2 mb-lg-0" v-if="props.row.delivered">
                                    <div class="text-center">
                                      <div class="my-2">
                                        <i class="fe-track font-16 text-success"></i>
                                      </div>
                                      <h5><b>{{ props.row.delivery_info.logistic_name }}</b></h5>
                                      <div class="mt-2 pt-1">
                                        <p class="mb-1">
                                          <span
                                            class="font-weight-semibold">Trak No: {{
                                              props.row.delivery_info.track_no
                                            }}</span>
                                        </p>
                                        <p class="mb-0">
                                          <span
                                            class="font-weight-semibold">Delivery Date :{{
                                              props.row.delivered_at|short_date
                                            }}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
<!--                                  <div class="card p-2 mb-lg-0" v-else>-->
<!--                                    <div class="text-center">-->
<!--                                      <div class="my-2">-->
<!--                                        <i class="fe-track font-16 text-muted"></i>-->
<!--                                      </div>-->
<!--                                    </div>-->
<!--                                  </div>-->
                                  <div class="card-body">
                                    <a href="javascript:void(0);" v-b-modal.modal-delivery class="card-link text-custom"
                                       @click="showDeliveryModal(props.row)">情報更新</a>
                                    <!--                                    <a href="javascript:void(0);" class="card-link text-custom">Another link</a>-->
                                  </div>
                                </div>
                              </div>
                            </div>
                          </template>
                        </el-table-column>
                        <el-table-column label="商品" width="260">
                          <template slot-scope="scope">
                            <div class="media align-items-center">
                              <div class="mr-3">
                                <img :src="scope.row.variant.thumbimage" alt="product-img" height="160"/>
                              </div>
                              <div class="media-body">
                                <p class="mb-0">X {{ scope.row.quantity }}</p>
                              </div>
                            </div>
                          </template>
                        </el-table-column>
                        <el-table-column
                          label="単価"
                          prop="variant.price">
                          <template slot-scope="scope">
                            <span class="d-block ">{{ scope.row.variant.price|currency("¥") }}</span>


                          </template>
                        </el-table-column>
                        <el-table-column
                          label="合計">
                          <template slot-scope="scope">
                            <span class="d-block ">{{
                                scope.row.variant.price * scope.row.quantity|currency("¥")
                              }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column
                          label="ステータス"
                          align="center"
                        >
                          <template slot-scope="scope">
                            <a href="javascript:void(0);" @click="updateOrderItemStatus(scope.row.id)"><span
                              class="badge"
                              :class="{'badge-soft-danger': scope.row.status === 'PROCESSING',
                                    'badge-soft-success': scope.row.status === 'FINISHED'}">
                                {{ scope.row.status }}
                              </span>
                              <b-spinner small label="Small Spinner" variant="danger" class="mt-3"
                                         v-if="scope.row.status === 'PROCESSING'"></b-spinner>
                            </a>
                          </template>
                        </el-table-column>
                        <el-table-column
                          label="配送">
                          <template slot-scope="scope">
                              <span class="badge"
                                    :class="{'text-danger': !scope.row.delivered ,
                                    'text-success': scope.row.delivered }">
                                <i class="fe-truck font-16"></i>
                              </span>
                          </template>
                        </el-table-column>
                        <el-table-column
                          label="支払">
                          <template slot-scope="scope">
                              <span class="badge"
                                    :class="{'text-danger': !scope.row.paid ,'text-success': scope.row.paid}">
                                <i class="fas fa-cash-register font-16"></i>
                              </span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end card -->

        <div class="row mb-3">

          <div class="col-lg-8">
            <div>
              <h4 class="font-15 mb-2">ポイント付与一覧
                <span class="badge badge-outline-danger badge-warning float-right">
                  {{ total_margin|currency("¥") }}</span>
              </h4>

              <div class="card p-2 mb-lg-0">
                <el-table
                  class="table table-centered border table-nowrap mb-lg-0"
                  :data="board_margins"
                  :default-sort="{prop: 'user', order: 'descending'}"
                  style="width: 100%">
                  <el-table-column label="User" sortable prop="user">
                    <template slot-scope="scope">
                      {{ scope.row.user }}
                      <i :class="{'ri-user-voice-fill text-danger':scope.row.info.level==='SUPERADMIN',
                                  'ri-team-fill  text-warning':scope.row.info.level==='CLIENTADMIN',
                                  'ri-user-heart-line  text-primary':scope.row.info.level==='LEVEL_1',
                                  'ri-map-pin-user-fill  text-default':scope.row.info.level==='USER_SELF',
                                  'ri-parent-fill  text-success':scope.row.info.level==='LEVEL_2',}"></i>
                      <br>
                      (#{{ scope.row.id }})
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="Amount"
                    align="right"
                    prop="amount">
                    <template slot-scope="scope">
                      <a href="javascript:void(0);" @click="updateMargin(scope.row.id)">
                        {{ scope.row.amount|currency("¥") }}
                      </a>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="OrderItem"
                    align="right"
                    sortable
                    prop="info.orderitem_id">
                    <template slot-scope="scope">

                      <a href="javascript:void(0);" @click="deleteMargin(scope.row.id)">
                        #{{ scope.row.info.orderitem_id }}
                      </a>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="OrderItem"
                    align="right"
                    sortable
                    prop="is_valid">
                    <template slot-scope="scope">
                      <a href="javascript:void(0);" @click="updateMargin_valid(scope.row.id, false)"
                         v-if="scope.row.is_valid">
                        <i class="ri-checkbox-circle-fill text-success"></i>
                      </a>

                      <a href="javascript:void(0);" @click="updateMargin_valid(scope.row.id, true)" v-else>
                        <i class="ri-close-circle-fill text-danger"></i>
                      </a>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div>
              <h4>注文概要</h4>
              <div class="table-responsive">
                <table class="table table-centered border mb-0">
                  <thead class="bg-light">
                  <tr>
                    <th colspan="3">サマリー</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <th scope="row">売上</th>
                    <td class="text-right">
                      <span class="d-block ">{{ order.Total|currency("¥") }}</span>
                      <div v-if="pointUSE.apply_point">
                        <p><i class="ri-bank-card-line text-success"></i>:{{ order.chargeAmount |currency("¥")}}<br>
                          <i class="ri-refund-2-fill text-danger"></i>:{{ pointUSE.use_point|currency("¥") }}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">仕入</th>
                    <td class="text-right">
                      <span class="d-block ">-{{ order.TotalPurchasePrice|currency("¥") }}</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">ポイント付与</th>
                    <td class="text-right">
                      <span class="d-block ">-{{ total_margin|currency("¥") }}</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Profit</th>
                    <td class="bg-danger text-white text-center font-16">
                      {{ profit|currency("¥") }}
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
        <div class="row mb-3">
          <div class="col-6">
            <div>
              <h4 class="font-15 mb-2">郵送先情報</h4>

              <div class="card p-2 mb-lg-0">
                <table class="table table-borderless table-sm mb-0">
                  <tbody>
                  <tr>
                    <th colspan="2">
                      <h5 class="font-15 m-0">{{ order.name }}</h5>
                    </th>
                  </tr>
                  <tr>
                    <th scope="row">Address:</th>
                    <td>〒{{ order.postcode }}{{ order.state }}{{ order.city }} <br>
                      {{ order.town }}{{ order.address_1 }} <br>
                      {{ order.address_2 }}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Phone :</th>
                    <td>{{ order.phone }}</td>
                  </tr>
                  <tr>
                    <th scope="row">Email :</th>
                    <td>{{ order.email }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div>
              <h4 class="font-15 mb-2">クレジットカード決済情報</h4>

              <div class="card p-2 mb-lg-0">
                {{ order.payment_info }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- end row -->
    <DeliveryModal :openDeliveryModal="showmodel_delivery" :order_id="order.id"
                   :orderitem="edit_orderitem" @updateResult="UpdateOrderItem"></DeliveryModal>
  </div>
</template>
