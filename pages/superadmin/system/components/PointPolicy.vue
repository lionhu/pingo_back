<script>
import {mapGetters} from "vuex"
import {swalService} from "~/helpers/fakebackend/swal.service.js"

export default {
  name: "system_pointpolicy_setting",
  head() {
    return {
      script: [
        {src: 'https://unpkg.com/element-ui/lib/index.js'}
      ],
      link: [
        {rel: 'stylesheet', href: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'}
      ]
    };
  },
  components: {
    Switches: () => import('vue-switches'),
    "el-tree": () => import('element-ui/lib/tree'),
    "el-button": () => import('element-ui/lib/button')
  },
  data() {
    return {
      redis_key: "MARGIN_POLICY",
      point_policy: {
        SUPERADMIN: true,
        CLIENTADMIN: true,
        LEVEL_1: true,
        LEVEL_2: true,
        USER_SELF: true,
        SELF_BOUGHT: {
          APPLY: false,
          LIMIT: 3
        }
      }
    };
  },
  computed: {
    ...mapGetters({
      // menuitems_store: "categories/getterCategoryList"
    }),
  },
  mounted() {
    // this.$store.dispatch("categories/load_superadmin_categorylist")
    let url = "/back/store/api/system/retrieve_systeminfo/";
    let vm = this;
    this.$axios.post(url, {"key": this.redis_key}).then((res) => {
      console.log(res)
      if (res.data.result) {
        vm.point_policy = res.data.data.systeminfo.info;
        swalService.showToast("success", "Load SystemInfo successfully!")
      }
    })

  },
  methods: {
    UpdateSystemInfo() {
      console.log(this.point_policy, this.redis_key);
      let url = "/back/store/api/system/create_or_update_systeminfo/";
      this.$axios.post(url, {"key": this.redis_key, "info": this.point_policy}).then((res) => {
        if (res.data.result) {
          swalService.showToast("success", "Updated successfully!")
        } else {
          swalService.showToast("error", "Failed to update system information")
        }
      })
    }
  }
};
</script>
<style>
.line-title-width {
  min-width: 45px !important;
}
</style>
<template>
  <div>
    <!--    <div class="row mb-2">-->
    <!--      <div class="col-sm-6">-->
    <!--        <a href="javascript:void(0);" class="btn btn-danger mb-2"><i-->
    <!--          class="mdi mdi-plus-circle mr-1"></i> Add Category-->
    <!--        </a>-->
    <!--      </div>-->
    <!--      <div class="col-sm-6">-->
    <!--        <div class="float-sm-right">-->
    <!--          <button type="button" class="btn btn-success mb-2 mb-sm-0">-->
    <!--            <i class="fe-settings"></i>-->
    <!--          </button>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5>Point Policy Settings:</h5>
            <div class="row mb-2">
              <div class="col-sm-6 col-xs-12">

                <div class="mt-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <label for="point_policy_superadmin">Client Superadmin</label>
                    <switches v-model="point_policy.SUPERADMIN" id="point_policy_superadmin" type-bold="false"
                              color="warning" class="ml-1 mb-0"></switches>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <label for="point_policy_client_admin">Client Admin</label>
                    <switches v-model="point_policy.CLIENTADMIN" id="point_policy_client_admin" type-bold="false"
                              color="warning" class="ml-1 mb-0"></switches>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <label for="point_policy_LEVEL_1">LEVEL_1</label>
                    <switches v-model="point_policy.LEVEL_1" id="point_policy_LEVEL_1" type-bold="false" color="warning"
                              class="ml-1 mb-0"></switches>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <label for="point_policy_LEVEL_2">LEVEL_2</label>
                    <switches v-model="point_policy.LEVEL_2" id="point_policy_LEVEL_2" type-bold="false" color="warning"
                              class="ml-1 mb-0"></switches>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <label for="point_policy_USER_SELF">USER_SELF</label>
                    <switches v-model="point_policy.USER_SELF" id="point_policy_USER_SELF" type-bold="false"
                              color="warning" class="ml-1 mb-0"></switches>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <label for="point_policy_SELF_BOUGHT_APPLY">SELF_BOUGHT</label>
                    <switches v-model="point_policy.SELF_BOUGHT.APPLY" id="point_policy_SELF_BOUGHT_APPLY"
                              type-bold="false" color="warning" class="ml-1 mb-0"></switches>
                  </div>
                  <div class="form-horizontal" v-if="point_policy.SELF_BOUGHT.APPLY">
                    <b-form-group id="example text" label-cols-sm="9" label-cols-lg="9" label="SELF_BOUGHT.LIMIT"
                                  label-for="point_policy_SELF_BOUGHT_LIMIT">
                      <b-form-input type="number" v-model="point_policy.SELF_BOUGHT.LIMIT"
                                    id="point_policy_SELF_BOUGHT_LIMIT"></b-form-input>
                    </b-form-group>
                  </div>
                </div>
              </div>

              <div class="col-sm-6 col-xs-12">
                <b-button pill class="btn-bordered-primary" variant="outline-primary" @click="UpdateSystemInfo">Update
                </b-button>
              </div>

              <!-- end col-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
