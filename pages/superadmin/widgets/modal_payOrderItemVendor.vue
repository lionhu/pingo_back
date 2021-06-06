<template>
  <div>
    <b-modal
      id="modal-payvendor"
      size="lg"
      centered
      title="Pay Vendor"
      :hide-footer="true"
      v-if="openPayOrderItemModal">

      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-6">
              <div class="form-group mb-3">
                <label class="col-form-label">Paid Vendor</label>
                <switches v-model="payinfo.paid" type-bold="false" color="success" class="ml-1 mb-0"></switches>
              </div>
              <div class="form-group mb-3">
                <label>Default Date Picker</label>
                <br/>
                <date-picker v-model="payinfo.paid_at" :first-day-of-week="1" lang="jp"></date-picker>
              </div>
            </div>
            <div class="col-6">
              <div class="form-group mb-3">
                <label class="col-md-6 col-form-label">memo_1</label>
                <div class="col-md-12">
                  <b-form-input for="text" v-model="payinfo.paid_info.value_1" placeholder="memo_1"></b-form-input>
                </div>
              </div>
              <div class="form-group mb-3">
                <label class="col-md-6 col-form-label">memo_2</label>
                <div class="col-md-12">
                  <b-form-input for="text" v-model="payinfo.paid_info.value_2" placeholder="memo_2"></b-form-input>
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
              <div class="text-center">
                <b-spinner class="m-2" variant="danger" role="status" v-if="updating"></b-spinner>
                <div class="mb-3">
                  <b-button variant="danger" class="btn-rounded ml-1" @click="batch_updatePayVendor">
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
import {mapGetters, mapState} from 'vuex'
import Switches from 'vue-switches'
import DatePicker from 'vue2-datepicker'
import Swal from 'sweetalert2'

export default {
  props: ['openPayOrderItemModal', "orderitem_ids"],
  data() {
    return {
      payinfo: {
        paid_at: new Date().toISOString(),
        paid: false,
        paid_info: {
          value_1: "memo 1",
          value_2: "memo 2"
        }
      },
      result: false,
      updating: false,
    }
  },
  components: {
    Switches,
    DatePicker
  },
  methods: {
    batch_updatePayVendor() {
      var vm = this;
      vm.updating = true;
      var updateinfo = {
        update_fields: ["payvendor"],
        orderitem_ids: this.orderitem_ids,
        payinfo: this.payinfo
      }
      console.log(updateinfo)
      this.$store.dispatch("orders/updateOrderItemInfo_superadmin", updateinfo)
        .then(response => {
          console.log(response)
          vm.updating = false;
          this.$emit("updateResult", response)
          vm.$bvModal.hide("modal-payvendor")
        });
    }
  },
}
</script>t
