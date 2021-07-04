<script>
import {axios} from "@/plugins/axios"

export default {
  name: "user_roles_selector",
  props: ["user", "showModal"],
  components: {
    Switches: () => import('vue-switches'),
  },
  data() {
    return {
      roles: {
        superadmin: false,
        vendor: false,
        staff:false,
        client_superadmin: false,
        client_admin: false,
        member: false,
      },
      errors: []
    };
  },
  watch: {
    user(newVal, oldVal) {
      console.log("user ", newVal.user_id)
      console.log("user roles", newVal.roles)
      this.roles = {
        superadmin: newVal.roles.includes("superadmin"),
        client_superadmin: newVal.roles.includes("client_superadmin"),
        client_admin: newVal.roles.includes("client_admin"),
        member: newVal.roles.includes("member"),
        vendor: newVal.roles.includes("vendor"),
      }
      console.log(this.roles)


    }
  },
  methods: {
    updateVendorInfo() {
      var new_roles = [];
      if (this.roles.superadmin) new_roles.push("superadmin");
      if (this.roles.vendor) new_roles.push("vendor");
      if (this.roles.member) new_roles.push("member");
      if (this.roles.client_admin) new_roles.push("client_admin");
      if (this.roles.client_superadmin) new_roles.push("client_superadmin");


      this.$store.dispatch("users/set_User_Role", {
        user_id: this.user.user_id,
        roles: new_roles
      }).then((user) => {
        console.log("update user role", user)
      this.$emit("closeModal",{result:true,user:user});
      })
    },
    closeModal() {
      this.$emit("closeModal",{result:false,user:null});
    }
  },
};
</script>

<template>
  <b-modal id="modal-user-roles-selector"
           scrollable title="User Roles"
           title-class="font-18"
           body-class="p-4"
           hide-footer
           v-if="showModal"
  >
    <form @submit.prevent="updateVendorInfo">
      <ul v-if="errors.length" class="text-danger">
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>

      <div class="form-group row d-flex justify-content-around">
<!--        <b-form-checkbox id="cb_superadmin" v-model="roles.superadmin" name="checkbox-1" :value="true"-->
<!--                         :unchecked-value="false">-->
<!--          SuperAdmin-->
<!--        </b-form-checkbox>-->
        <b-form-checkbox id="cb_staff" v-model="roles.staff" name="checkbox-2" :value="true"
                         :unchecked-value="false">
          Staff
        </b-form-checkbox>

        <b-form-checkbox id="cb_vendor" v-model="roles.vendor" name="checkbox-2" :value="true"
                         :unchecked-value="false">
          Vendor
        </b-form-checkbox>
      </div>
      <div class="form-group row d-flex justify-content-around">
        <b-form-checkbox id="cb_client_superadmin" v-model="roles.client_superadmin" name="checkbox-2" :value="true"
                         :unchecked-value="false">
          Client SuperAdmin
        </b-form-checkbox>
        <b-form-checkbox id="cb_client_admin" v-model="roles.client_admin" name="checkbox-2" :value="true"
                         :unchecked-value="false">
          Client Admin
        </b-form-checkbox>
        <b-form-checkbox id="cb_member" v-model="roles.member" name="checkbox-2" :value="true"
                         :unchecked-value="false">
          Member
        </b-form-checkbox>

      </div>
      <div class="form-group row d-flex justify-content-between">

      </div>
      <div class="form-group row">
        <div class="col-8 offset-4">
          <button type="submit" class="btn btn-primary">Submit</button>
          <button type="reset" class="btn btn-secondary m-l-5 ml-1" @click="closeModal(false)">Cancel</button>
        </div>
      </div>
    </form>

  </b-modal>

</template>
