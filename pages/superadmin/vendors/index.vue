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
      perPage: 5,
      pageOptions: [5, 10, 25, 50, 100],
      filter: null,
      multipleSelection: [],
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
      admin: {
        id: 0,
        name: ""
      },
      vendor_admin_name: "",
      visible_VendorEdit: false,
      edit_vendor_id: 0,
      submitted: false
    };
  },
  computed: {
    ...mapState({
      list: state => state.vendors.list
    }),
  },
  mounted() {
    this.load_vendors_list(`?page_size=${this.perPage}`)
  },
  watch: {
    perPage: function (val) {
      let option = `?page_size=${val}`
      this.load_vendors_list(option)
    },
    filter: function (val) {
      console.log(val)
      let url = `http://localhost:8000/apiauth/users/?page=1&page_size=${val}`
      this.load_vendors_list(url)
    }
  },
  methods: {
    change_vendorlist_page(pagelink) {
      let url = "?" + pagelink.split("/?")[1];
      this.load_vendors_list(url)
    },
    load_vendors_list(options) {
      this.$store.dispatch("vendors/load_superadmin_vendorlist", options);
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
    changeVendorAdmin(vendor) {
      var newid = 0;
      var vm = this;
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      })
      Swal.fire({
        title: 'New Admin ID',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Look up',
        showLoaderOnConfirm: true,
        preConfirm: (new_admin_id) => {
          newid = new_admin_id
          return this.$axios.post(`/apiauth/users/${new_admin_id}/get_username/`)
            .then(response => {
              if (!response.data.result) {
                throw new Error(response.data.message)
              }
              return response.data.username
              // return response.json()
            }).catch(error => {
              Swal.showValidationMessage(
                `Request failed: ${error}`
              )
            })
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        console.log(result)
        if (result.isConfirmed && result.value) {
          swalWithBootstrapButtons.fire({
            title: `${result.value}`,
            text: `Are you sure about this new Admin?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Change it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
          }).then((res) => {
            if (res.isConfirmed) {
              vendor.admin_id = newid;
              console.log(vm.vendor)
              vm.$store.dispatch("vendors/update_vendor", vendor);

              swalWithBootstrapButtons.fire(
                'Updated!',
                'Admin of vendor has been updated.',
                'success'
              )
            } else if (
              /* Read more about handling dismissals below */
              res.dismiss === Swal.DismissReason.cancel
            ) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
              )
            }
          })
        }
      })
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(this.multipleSelection)
    },
    showVendorModal(vendor_id, mode) {
      this.edit_vendor_id = vendor_id;
      this.mode = mode;
      this.visible_VendorEdit = true;
    },
    closeVendorModal(info) {
      if (info.result) {
        this.mode = "";
        this.visible_VendorEdit = false;
      }
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
              <div class="col-sm-6">
              </div>
              <div class="col-sm-6">
                <div class="float-sm-right">
                  <button type="button" class="btn btn-success mb-2 mb-sm-0">
                    <i class="mdi mdi-cog"></i>
                  </button>
                </div>
              </div>
              <!-- end col-->
            </div>
            <div class="row mb-2">
              <div class="col-sm-12 col-md-6">
                <div id="tickets-table_length" class="dataTables_length">
                  <label class="d-inline-flex align-items-center">
                    Display&nbsp;
                    <b-form-select v-model="perPage" size="sm" :options="pageOptions"></b-form-select>&nbsp;Customers
                  </label>
                </div>
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
                :data="list.results"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column
                  type="selection"
                  width="55">
                </el-table-column>

                <el-table-column type="expand">
                  <template slot-scope="props">

                    <div class="card">
                      <div class="card-body">
                        <div class="row" v-if="vendor">
                          <div class="col-6">
                            <b-form-group id="fieldset-name" label="Name" label-for="name">
                              <b-form-input id="name" v-model="vendor.name"></b-form-input>
                            </b-form-group>
                            <b-form-group id="fieldset-website" label="Website" label-for="website">
                              <b-form-input id="website" v-model="vendor.website"></b-form-input>
                            </b-form-group>
                            <b-form-group id="fieldset-phone" label="Phone" label-for="phone">
                              <b-form-input id="phone" v-model="vendor.phone"></b-form-input>
                            </b-form-group>
                            <b-form-group id="fieldset-address_2" label="Email" label-for="email">
                              <b-form-input id="email" v-model="vendor.email" type="email"></b-form-input>
                            </b-form-group>
                          </div>
                          <div class="col-6">
                            <b-form-group id="fieldset-postcode" label="Address" label-for="postcode">
                              <b-form-input id="postcode" v-model="vendor.postcode"></b-form-input>
                            </b-form-group>
                            <b-form-group id="fieldset-state">
                              <b-form-input id="state" v-model="vendor.state"></b-form-input>
                            </b-form-group>
                            <b-form-group id="fieldset-city">
                              <b-form-input id="city" v-model="vendor.city"></b-form-input>
                            </b-form-group>
                            <b-form-group id="fieldset-town">
                              <b-form-input id="town" v-model="vendor.town"></b-form-input>
                            </b-form-group>
                            <b-form-group id="fieldset-address_1">
                              <b-form-input id="address_1" v-model="vendor.address_1"></b-form-input>
                            </b-form-group>
                            <b-form-group id="fieldset-address_2">
                              <b-form-input id="address_2" v-model="vendor.address_2"></b-form-input>
                            </b-form-group>
                            <b-button variant="primary" @click="updateVendorInfo">Submit</b-button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="id" label="#ID" width="50"></el-table-column>
                <el-table-column
                  prop="name"
                  align="center"
                  label="name">
                  <template slot-scope="scope" class="text-center">
                    <h4>{{ scope.row.name }}</h4>
                    <button class="btn btn-rounded btn-outline-success" @click="changeVendorAdmin(scope.row)">
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
            <div class="row mt-2">
              <div class="col">
                <div class="dataTables_paginate paging_simple_numbers float-right">
                  <ul class="pagination pagination-rounded">
                    <!--                    <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" @change="page_changed"></b-pagination>-->
                  </ul>
                  <a href="javascript:void(0);" class="btn btn-success"
                     @click="change_vendorlist_page(list.links.previous)"><i
                    class="fe-chevron-left"></i></a>
                  <span class="btn btn-success">{{ list.page }}/{{ list.total_pages }}</span>
                  <a href="javascript:void(0);" class="btn btn-success"
                     @click="change_vendorlist_page(list.links.next)"><i
                    class="fe-chevron-right"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ModalVendorEdit :showModal="visible_VendorEdit" :mode="mode" :vendor_id="edit_vendor_id"
                     @closeMoal="closeVendorModal"/>
  </div>
</template>
