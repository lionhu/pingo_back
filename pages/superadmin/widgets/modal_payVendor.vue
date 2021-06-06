<template>
  <div>
    <b-modal
      id="modal-payvendor"
      size="lg"
      centered
      title="Pay Vendor"
      :hide-footer="true"
      v-if="openModal">

      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-12">
              <div class="form-group mb-3">
                <label class="col-md-3 col-form-label">Paid Vendor</label>
                <div class="col-md-9">
                  <switches v-model="payinfo.is_paid" type-bold="false" color="success" class="ml-1 mb-0"></switches>
                </div>
              </div>
              <div class="form-group mb-3">
                <label>Default Date Picker</label>
                <br/>
                <date-picker v-model="payinfo.paid_at" :first-day-of-week="1" lang="jp"></date-picker>
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
                  <b-button  variant="danger" class="btn-rounded ml-1" @click="batch_updatePayVendor">
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
  props: ['openModal', "orders"],
  data() {
    return {
      payinfo: {
        paid_at: new Date().toISOString(),
        is_paid: false
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
      var updateinfo = {
        update_fields: ["payvendor"],
        order_ids: this.orders,
        payinfo: this.payinfo
      }
      if(!this.payinfo.is_paid || (this.payinfo.is_paid && this.payinfo.paid_at)){
        if(!this.payinfo.is_paid) delete this.payinfo.paid_at;
        this.updating = true;
        this.$store.dispatch("orders/updateOrder_PayVendor_BATCH", updateinfo)
          .then(response=>{
             vm.updating=false;
             vm.$bvModal.hide("modal-payvendor")
        });
      } else {
        Swal.fire("Caution!", "Check again your input!", "warning")
      }
    }
  },
}
</script>t
