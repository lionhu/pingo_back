<script>
import {swalService} from "@/helpers/fakebackend/swal.service"
import {axios} from "@/plugins/axios";

export default {
  name: "client_pointpolicy",
  props: ["client","showEditClientPointPolicyModal"],
  components: {
    Switches: () => import('vue-switches'),
  },
  data() {
    return {
      point_policy: {
        POLICIES: {
          LEVEL_1: true,
          LEVEL_2: true,
          USER_SELF: false,
          SUPERADMIN: false,
          CLIENTADMIN: false,
          SELF_BOUGHT: {
            APPLY: false,
            LIMIT: 3
          }
        },
        JOIN_BONUS_POLICY: {
          POINT: 1000,
          APPLY: true
        },
        INTRODUCE_POINT_POLICY: {
          POINT: 1000,
          APPLY: true
        }
      }
    };
  },
  watch: {
    client() {
      this.point_policy=this.client.margin_policy;
    }
  },
  methods: {
    updateProductVariationInformation() {
        let vm =this;
        let url = `/apiauth/client/${this.client.id}/update_partial/`
        axios.$post(url,{"margin_policy":this.point_policy})
        .then((response) => {
          vm.$emit("result",response.result)
        })
    },
  },
};
</script>

<template>

  <b-modal id="modal_client_pointpolicy"
           scrollable
           centered
           title="Edit Points Policy Information"
           title-class="font-18"
           body-class="p-4"
           hide-footer
           v-if="showEditClientPointPolicyModal"
  >
    <form @submit.prevent="updateProductVariationInformation">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5>Point Policy Settings:</h5>
              <div class="row mb-2">
                <div class="col-12">

                  <div class="mt-3">
                    <div class="d-flex justify-content-between align-items-center">
                      <label for="point_policy_superadmin">Client Superadmin</label>
                      <switches v-model="point_policy.POLICIES.SUPERADMIN" id="point_policy_superadmin"
                                type-bold="false"
                                color="warning" class="ml-1 mb-0"></switches>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <label for="point_policy_client_admin">Client Admin</label>
                      <switches v-model="point_policy.POLICIES.CLIENTADMIN" id="point_policy_client_admin"
                                type-bold="false"
                                color="warning" class="ml-1 mb-0"></switches>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <label for="point_policy_LEVEL_1">LEVEL_1</label>
                      <switches v-model="point_policy.POLICIES.LEVEL_1" id="point_policy_LEVEL_1" type-bold="false"
                                color="warning"
                                class="ml-1 mb-0"></switches>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <label for="point_policy_LEVEL_2">LEVEL_2</label>
                      <switches v-model="point_policy.POLICIES.LEVEL_2" id="point_policy_LEVEL_2" type-bold="false"
                                color="warning"
                                class="ml-1 mb-0"></switches>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <label for="point_policy_USER_SELF">USER_SELF</label>
                      <switches v-model="point_policy.POLICIES.USER_SELF" id="point_policy_USER_SELF" type-bold="false"
                                color="warning" class="ml-1 mb-0"></switches>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <label for="point_policy_SELF_BOUGHT_APPLY">SELF_BOUGHT</label>
                      <switches v-model="point_policy.POLICIES.SELF_BOUGHT.APPLY" id="point_policy_SELF_BOUGHT_APPLY"
                                type-bold="false" color="warning" class="ml-1 mb-0"></switches>
                    </div>
                    <div class="form-horizontal" v-if="point_policy.POLICIES.SELF_BOUGHT.APPLY">
                      <b-form-group id="example text" label-cols-sm="9" label-cols-lg="9" label="SELF_BOUGHT.LIMIT"
                                    label-for="point_policy_SELF_BOUGHT_LIMIT">
                        <b-form-input type="number" v-model="point_policy.POLICIES.SELF_BOUGHT.LIMIT"
                                      id="point_policy_SELF_BOUGHT_LIMIT"></b-form-input>
                      </b-form-group>
                    </div>
                    <hr>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-8 offset-4">
          <button type="submit"  class="btn btn-primary">Submit</button>
        </div>
      </div>
    </form>

  </b-modal>

</template>
