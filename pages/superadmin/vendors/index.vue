<script>
import {mapState} from "vuex"
import Swal from 'sweetalert2'
import {
  required,
  email,
  minValue,
  url
} from 'vuelidate/lib/validators'
import ModalVendorEdit from "../components/VendorEditModal"
import {axios} from '@/plugins/axios.js';

export default {
  name:"vendor_list",
  head() {
    return {
      title: `${this.title} | Admin Dashboard`,
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
    // "el-autocomplete": () => import('element-ui/lib/autocomplete'),
    ModalVendorEdit
  },
  data() {
    return {
      title: "vendors",
      items: [
        {
          text: "PINGO"
        },
        {
          text: "eCommerce"
        },
        {
          text: "Vendors",
          active: true
        }
      ],
      auto_searching: false,
      autocomplete_address: false,
      searchkey: "",
      mode: "edit",
      vendor: {
        name: "",
        postcode: "",
        state: "",
        city: "",
        town: "",
        address_1: "",
        address_2: "",
        phone: "",
        email: "",
        website: "",
        admin_id: 0
      },
      vendorlist:[],
      vendor_admin_name: "",
      visible_VendorEdit: false,
      edit_vendor_id: 0,
    };
  },
  mounted() {
    this.load_vendors_list()
  },
  methods: {
    load_vendors_list() {
      let vm=this;
      axios.get("/back/store/api/vendors/").then(res =>{
        if(res.data.result){
          vm.vendorlist=res.data.data.results;
        }
      })
      // this.$store.dispatch("vendors/load_superadmin_vendorlist", options);
    },
    removeVendorInfo(vendor_id) {
      if (vendor_id) {
        let vm = this;
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.isConfirmed) {
            this.$store.dispatch("vendors/remove_vendor", vendor_id);
          }
        })
      }
    },

    SearchUsers() {
      if (this.searchkey !== "") {
        let option = `?page_size=${this.perPage}&search=${this.searchkey}`
        this.load_vendors_list(option)
      }
    },
    showVendorModal(vendor_id, mode) {
      this.edit_vendor_id = vendor_id;
      this.mode = mode;
      this.visible_VendorEdit = true;
    },
    closeVendorModal(info) {
      if (info.result && info.mode==="edit") {
        const index=this.vendorlist.findIndex(vendor=>vendor.id ===info.vendor.id)
        if (index>-1){
          this.vendorlist.splice(index,1,info.vendor)
        }
      }
        this.mode = "";
        this.visible_VendorEdit = false;


    }
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>
<style>
.line-title-width {
  min-width: 45px !important;
}
</style>
<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <div class="row mb-2">
      <div class="col-sm-6 offset-sm-6">
        <div class="float-sm-right">
          <b-button v-b-modal.modal-edit-vendor
                    variant="danger" @click="showVendorModal(0,'add')">
            Add Vendor
          </b-button>
        </div>
      </div>
      <!-- end col-->
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-sm-12 col-md-6">
              </div>
              <!-- Search -->
              <div class="col-sm-12 col-md-6">
                <div id="tickets-table_filter" class="dataTables_filter text-md-right">
                  <div class="input-group d-inline-flex align-items-center">
                    <input type="text" class="form-control" placeholder="username or email"
                           aria-describedby="basic-addon2" v-model="searchkey"/>
                    <div class="input-group-append">
                      <button class="btn btn-dark waves-effect waves-light" type="button" @click="SearchUsers">Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- End search -->
            </div>
            <!-- Table -->
            <div class="table-responsive mb-0">
              <el-table
                ref="multipleTable"
                :data="vendorlist"
                tooltip-effect="dark"
                style="width: 100%">
                <el-table-column prop="id" label="#ID" width="50"></el-table-column>
                <el-table-column
                  prop="name"
                  align="center"
                  label="name">
                  <template slot-scope="scope" class="text-center">
                    <h4>{{ scope.row.name }}</h4>
                    <button class="btn btn-rounded btn-outline-success">
                      {{ scope.row.admin_name }}
                    </button>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Address">
                  <template slot-scope="scope">
                    <ul class="list-unstyled">
                      <li><span class="inline-block mr-1">ADD:</span>〒{{ scope.row.postcode }}
                        {{ scope.row.state }}{{ scope.row.city }}
                      </li>
                      <li>{{ scope.row.town }}{{ scope.row.address_1 }}</li>
                      <li>{{ scope.row.address_2 }}</li>
                      <li><span class="inline-block mr-1">TEL:</span>{{ scope.row.phone }}</li>
                      <li><span class="inline-block mr-1">Phone:</span>{{ scope.row.email }}</li>
                    </ul>
                  </template>
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <ul class="list-inline table-action m-0">
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" class="action-icon">
                          <i class="mdi mdi-eye"></i></a>
                      </li>
                      <li class="list-inline-item">

                        <a href="javascript:void(0);" v-b-modal.modal-edit-vendor variant="danger"
                           @click="showVendorModal(scope.row.id,'edit')">
                          <i class="fe-edit"></i>
                        </a>
                      </li>
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" class="action-icon" @click="removeVendorInfo(scope.row.id)">
                          <i class="fe-trash-2"></i></a>
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
    <ModalVendorEdit :showModal="visible_VendorEdit" :mode="mode" :vendor_id="edit_vendor_id"
                     @closeMoal="closeVendorModal"/>
  </div>
</template>
