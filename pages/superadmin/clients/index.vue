<script>
import Swal from 'sweetalert2'
import {swalService} from "@/helpers/fakebackend/swal.service"
import {axios} from "@/plugins/axios";

export default {
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
    "Client_PointPolicy":()=>import("../components/PointPolicyModal")
  },
  data() {
    return {
      title: "users",
      items: [
        {
          text: "PINGO"
        },
        {
          text: "eCommerce"
        },
        {
          text: "Users",
          active: true
        }
      ],
      multipleSelection: [],
      mode: "edit",
      client: {
        "name": "",
        "description": "",
      },
      showEditClientPointPolicyModal:false,
      edit_client:{}
    };
  },
  async asyncData({params}) {
    let url = `/apiauth/client/show_for_superadmin/`
    let response_data = await axios.$post(url)
      .then((response) => {
        if (response.result) {
          return response.data
        }
      })
    return {clients: response_data.clients, superadmins: response_data.superadmins}
  },
  computed: {
    rows() {
      return this.clients.length;
    },
  },
  mounted() {
  },
  methods: {
    /**
     * Search the table data with search input
     */
    remove_client(client_id) {
      let vm = this;
      if (client_id) {
        Swal.fire({
          title: 'Are you sure?',
          text: "代理店を削除しますか？",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: '削除!'
        }).then((result) => {
          if (result.isConfirmed) {
            this.$store.dispatch("clients/remove_client", client_id).then((response) => {

              var client_id = parseInt(response.client_id);
              if (client_id) {
                let index = vm.clients.findIndex(client => client.id === client_id)
                if (index > -1) {
                  vm.clients.splice(index, 1)
                  swalService.showToast("success", "Remove Client successfully!")
                }
              }
            });
          }
        })
      }
    },
    async show_edit_client(client) {
      let vm = this;
      const {value: formValues} = await Swal.fire({
        title: 'Create',
        html:
          `<span>Client Name:</span><input id="swal-input1" placeholder="name" class="swal2-input" value="${client.name}">` +
          `<span>Description:</span><input id="swal-input2" placeholder="description" class="swal2-input"  value="${client.description}">`,
        focusConfirm: true,
        showCancelButton: true,
        confirmButtonText: `Save`,
        preConfirm: (result) => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value,
          ]
        }
      })

      if (formValues !== undefined && formValues[0] !== "" && formValues[1] !== "") {
        vm.client.id = client.id;
        vm.client.name = formValues[0];
        vm.client.description = formValues[1];
        vm.$store.dispatch("clients/update_client", vm.client).then((response) => {
          if (response.client) {
            let clientIndex = vm.clients.findIndex(client => client.id === response.client.id)
            if (clientIndex > -1) {
              vm.clients.splice(clientIndex, 1, response.client)
              Swal.fire("Success", "client information has been update!", "success")
            }
          } else {
            Swal.fire("Oops!", response, "danger")
          }

        })
      }
    },
    show_pointpolicy_client(client){
      if(client){
      this.edit_client = client;
      this.showEditClientPointPolicyModal=true;
      }
    },
    async show_add_client() {
      let vm = this;
      const {value: formValues} = await Swal.fire({
        title: '代理店登録',
        html:
          '<span>代理店名:</span><input id="swal-input1" placeholder="name" class="swal2-input">' +
          '<span>説明:</span><input id="swal-input2" placeholder="description" class="swal2-input">' +
          '<span>Client_Superadmin ID:</span><input id="swal-input3" placeholder="client_superadmin_id" class="swal2-input">' +
          '<span>Client_Admin ID:</span><input id="swal-input4" placeholder="admin_id" class="swal2-input">',
        focusConfirm: true,
        showCancelButton: true,
        confirmButtonText: `Save`,
        preConfirm: (result) => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value,
            document.getElementById('swal-input3').value,
            document.getElementById('swal-input4').value,
          ]
        }
      })

      if (formValues !== undefined && formValues[0] !== "" && formValues[2] !== "" && formValues[1] !== "") {
        this.client.name = formValues[0];
        this.client.description = formValues[1];
        this.client.client_superadmin_id = formValues[2];
        this.client.admin_id = formValues[3];
        this.$store.dispatch("clients/register_client", this.client).then((response) => {
          if (response.client) {
            vm.clients.push(response.client)

            swalService.showToast("success", "Add Client successfully!")
          }
        })
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    superadminsRowClick(row, column, event) {
      let vm = this;
      let url = `/apiauth/client/${row.id}/of_superadmin/`
      axios.$post(url)
        .then((response) => {
          if (response.result) {
            vm.clients = [];
            vm.clients = response.data.clients;
          }
        })
    },
    ProcessClientPointPolicy(result){
      if (result) {
            swalService.showToast("success", "client information has been update!")
          }else{
            swalService.showToast("error", "Failed to updated client information")
      }
      this.showEditClientPointPolicyModal=false;
    }
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>

<template>
  <div>
    <PageHeader :title="$t('menuitems.organizations.client.text')" :items="items"/>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5>総代理店</h5>
            <p class="text-muted">クリックしたら、傘下の代理店情報が表示されます。</p>
            <div class="table-responsive mb-0">
              <el-table
                ref="multipleTable"
                :data="superadmins"
                tooltip-effect="dark"
                :default-sort="{prop: 'id', order: 'descending'}"
                @row-click="superadminsRowClick"
                style="width: 100%">
                <el-table-column
                  prop="id"
                  label="#ID"
                  width="80">
                </el-table-column>
                <el-table-column prop="username" label="Username">
                </el-table-column>
                <el-table-column
                  label="email">
                  <template slot-scope="scope">
                    {{ scope.row.email }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="get_descendants_count"
                  sortable
                  label="followers">
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-sm-6">
                <a href="javascript:void(0)" @click="show_add_client" class="btn btn-danger mb-2"><i
                  class="mdi mdi-plus-circle mr-1"></i>Add Client</a>
              </div>
            </div>
            <!-- Table -->
            <div class="table-responsive mb-0">
              <el-table
                ref="multipleTable"
                :data="clients"
                tooltip-effect="dark"
                :default-sort="{prop: 'followers', order: 'descending'}"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column
                  type="selection"
                  width="55">
                </el-table-column>
                <el-table-column
                  prop="name"
                  label="Name"
                  width="120">
                </el-table-column>
                <el-table-column
                  label="client_superadmin">
                  <template slot-scope="scope">
                    <span v-if="scope.row.client_superadmin">{{
                        scope.row.client_superadmin.username
                      }}(#{{ scope.row.client_superadmin.id }})</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="admin">
                  <template slot-scope="scope">
                    <button class="btn btn-rounded btn-outline-success">
                    <span v-if="scope.row.admin">{{ scope.row.admin.username }}(#{{ scope.row.admin.id }})</span>
                  </button>

                  </template>
                </el-table-column>
                <el-table-column
                  label="email">
                  <template slot-scope="scope">
                    <span v-if="scope.row.admin">{{ scope.row.admin.email }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="followers"
                  sortable
                  label="followers">
                </el-table-column>
                <el-table-column
                  show-overflow-tooltip>
                  <template slot-scope="scope">
                    <ul class="list-inline table-action m-0">
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" class="action-icon" @click="show_edit_client(scope.row)">
                          <i class="fe-edit-1"></i></a>
                      </li>
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" v-b-modal:modal_client_pointpolicy class="action-icon" @click="show_pointpolicy_client(scope.row)">
                          <i class="ri-coin-fill text-warning"></i></a>
                      </li>
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" class="action-icon" @click="remove_client(scope.row.id)"
                           v-if="scope.row.id!==1">
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
    <Client_PointPolicy @result="ProcessClientPointPolicy" :client="edit_client" :showEditClientPointPolicyModal="showEditClientPointPolicyModal"/>
  </div>
</template>
