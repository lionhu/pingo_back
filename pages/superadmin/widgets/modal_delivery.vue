<template>
  <div>
    <b-modal
      id="modal-delivery"
      size="lg"
      centered
      :title="'Delivery information  #'+orderitem.id"
      :hide-footer="true"
      v-if="openDeliveryModal">

      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-6">
              <div class="form-group mb-3">
                <label class="col-form-label">Already Delivered?</label>
                <switches v-model="info.delivered" type-bold="false" color="success"
                          class="ml-1 mb-0"></switches>
              </div>
              <div class="form-group mb-3">
                <label>Delivery Date</label>
                <br/>
                <date-picker v-model="info.delivered_at" lang="jp"></date-picker>
              </div>
            </div>
            <div class="col-6 border-left">
              <div class="form-group mb-3">
                <label class="col-md-6 col-form-label">物流業者</label>
                <div class="col-md-12">
                  <b-form-select v-model="info.delivery_info.logistic_name" :options="logistic_options">
                  </b-form-select>

                </div>
              </div>
              <div class="form-group mb-3">
                <label class="col-md-6 col-form-label">追跡番号</label>
                <div class="col-md-12">
                  <b-form-input for="text" v-model="info.delivery_info.track_no"></b-form-input>
                </div>
              </div>
              <div class="form-group mb-3">
                <label class="col-md-6 col-form-label">追跡リンク</label>
                <div class="col-md-12">
                  <b-form-input for="text" v-model="info.delivery_info.track_link"></b-form-input>
                </div>
              </div>
            </div>
            <!-- end col -->
          </div>
          <div class="row">
            <div class="col-12">
              <div class="text-center" v-if="result">
                <h2 class="mt-0">
                  <i class="mdi mdi-check-all"></i>
                </h2>
                <h3 class="mt-0">Thank you !</h3>

                <p class="w-75 mb-2 mx-auto">
                  Successfully updated!
                </p>
              </div>
              <div class="text-center mt-md-3">
                <b-spinner class="m-2" variant="danger" role="status" v-if="updating"></b-spinner>
                <div class="mb-3">
                  <b-button variant="danger" class="btn-rounded ml-1" @click="update_orderitem">
                    Update
                  </b-button>
                </div>
              </div>
            </div>
            <!-- end col -->
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script>
export default {
  props: ['openDeliveryModal', "orderitem", "order_id"],
  data() {
    return {
      info: {
        update_fields: ["delivery"],
        delivered_at: new Date(),
        delivered: false,
        delivery_info: {
          track_no: "",
          track_link: "",
          logistic_name: "",
        }
      },
      logistic_options: [
        "ヤマト",
        "日本郵政"
      ],
      result: false,
      updating: false
    }
  },
  watch: {
    openDeliveryModal: function (newvalue, oldvalue) {
      if (newvalue) {
        this.info.delivered = this.orderitem.delivered;
        this.info.delivery_info.track_link = this.orderitem.delivery_info.track_link;
        this.info.delivery_info.track_no = this.orderitem.delivery_info.track_no;
        this.info.delivery_info.logistic_name = this.orderitem.delivery_info.logistic_name;
      }
    }
  },
  components: {
    Switches: () => import('vue-switches'),
    DatePicker: () => import('vue2-datepicker'),
  },
  methods: {
    update_orderitem() {
      var vm = this;
      var orderitem_ids = [];
      orderitem_ids.push(this.orderitem.id);

      var updateinfo = {
        order_id: this.order_id,
        orderitem_ids: orderitem_ids,
        update_fields: ["delivery"],
        delivered_at: this.info.delivered_at!==""?this.info.delivered_at.toISOString():new Date(),
        delivered: this.info.delivered,
        delivery_info: {
          track_no: this.info.delivery_info.track_no,
          track_link: this.info.delivery_info.track_link,
          logistic_name: this.info.delivery_info.logistic_name
        }
      };

      this.$store.dispatch("orders/updateOrderItemInfo_superadmin", updateinfo)
        .then(response => {
          if (response) {
            vm.updating = false;
            vm.info = {
              update_fields: ["delivery"],
              delivered_at: new Date(),
              delivered: false,
              delivery_info: {
                track_no: "",
                track_link: "",
                logistic_name: "",
              }
            };
            vm.$emit("updateResult", {result: true, order: response.order, orderitems: response.orderitems})
            vm.$bvModal.hide("modal-delivery")
          }
        });
    }
  },
}
</script>
