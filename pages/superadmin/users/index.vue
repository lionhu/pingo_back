<script>
import {mapState} from "vuex"
import {swalService} from "../../../helpers/fakebackend/swal.service"
import Swal from "sweetalert2"

export default {
  name: "superadmin_user_management",
  head() {
    return {
      title: ` Admin Dashboard`,
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
    "el-input": () => import('element-ui/lib/input'),
    "el-tree": () => import('element-ui/lib/tree'),
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
      searchkey: "",
      mode: "edit",
      user_selected: false,
      user: {
        username: "",
        id: 0
      },
      childrenlist: [],
      props: {
        label: 'username',
        children: 'children',
        isLeaf: 'leaf',
        followers: 'get_descendants_count',
        user_id: 0
      },
      targetNodes: []
    };
  },
  computed: {
    ...mapState({
      list: state => state.users.list
    }),
  },
  watch: {
    perPage: function (val) {
      let url = `http://localhost:8000/apiauth/users/?page=1&page_size=${val}`
      this.load_users_list(url)
    },
    filter: function (val) {
      let url = `http://localhost:8000/apiauth/users/?page=1&page_size=${val}`
      this.load_users_list(url)
    },
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    load_users_list(pagelink) {
      let vm = this;
      if (pagelink) {
        let url = "/" + pagelink.split("/").splice(3).join("/");
        this.$store.dispatch("users/load_superadmin_users", url)
          .then(response => {
            vm.childrenlist = response.map((user) => {
              user.role = user.roles[0];
              return user;
            })
          })
      }
    },
    SearchUsers() {
      if (this.searchkey !== "") {
        let url = `http://localhost:8000/apiauth/users/?search=${this.searchkey}`
        this.load_users_list(url)
      }
    },
    async changeUserRole(user) {
      if (user.role !== "superadmin" && user.role !== "client_admin" && user.role !== "client_superadmin") {
        let vm = this;
        const selectOptions = {
          // 'vendor': 'Vendor',
          // 'client_superadmin': 'CSA',
          // 'client_admin': 'CA',
          'member': 'Member',
          "staff": "Staff"
        };
        const {value: role} = await Swal.fire({
          title: 'Select Role',
          input: 'radio',
          inputOptions: selectOptions,
          inputValue: user.role !== undefined ? user.role : "None",
          inputValidator: (value) => {
            if (!value) {
              return 'You need to choose something!'
            }
          }
        })
        if (role && user.role !== role) {
          this.$store.dispatch("users/set_User_Role", {
            user_id: user.user_id,
            role: role
          }).then((response) => {
            console.log("update user role", response)
            vm.refreshChildrenList(response, role)
            swalService.showModal('Change Role', 'Role has been changed', 'success')
          })
        }
      }

    },
    refreshChildrenList(child_id, role) {
      console.log(child_id, role)
      var index = this.childrenlist.findIndex(child => child.user_id === child_id)
      console.log(index)
      if (index > -1) {
        this.childrenlist[index].role = role;
      }
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
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
    loadNode(node, resolve) {
      console.log("loadNode", node.data)
      let vm = this;
      if (node.level === 0) {
        return resolve([{username: 'PINGO.JP', user_id: 1, follower: 0}]);
      }
      this.$axios.post(`/apiauth/profile/${node.data.user_id}/retrieve_children/`).then((response) => {
        console.log("load node dynamically", response)

        if (response.data.result) {
          var new_children = response.data.data.children.map((node) => {
            node.leaf = node.children.length === 0;
            node.role = node.roles[0];
            return node;
          })
          console.log(new_children)
          vm.childrenlist = new_children;
          resolve(new_children)
        }
      });
    },
    remove_user(user_id, username) {
      let vm = this;
      Swal.fire({
        title: 'Are you sure?',
        text: `All ${username}'s information will be deleted. `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.$axios.delete(`/apiauth/users/${user_id}/`).then((response) => {
            console.log(response)
            if (response.data.result) {
              var index = vm.childrenlist.findIndex(user => user.id === user_id)
              if (index > -1) {
                vm.childrenlist.splice(index, 1)
              }
            }
          });
        }
      })
    },
    user_moveto(user_id,username) {
      Swal.fire({
        title: 'MoveTo User under Parent',
        input: 'number',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Look up',
        showLoaderOnConfirm: true,
        preConfirm: (parentID) => {
          let url=`/apiauth/profile/${parentID}/validate_userid/`;
          return this.$axios.post(url)
            .then(response => {
              console.log("response data",response.data)
              if (!response.data.result) {
                throw new Error(`Username (#${user_id}) does not exist!`)
              }
              return response.data.user
            })
            .catch(error => {
              Swal.showValidationMessage(
                `Request failed: ${error}`
              )
            })
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        let parent=result;
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Are you sure?',
            text: `MoveTo ${username} under ${parent.value.username}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, move it!'
          }).then((result) => {
            if (result.isConfirmed) {
              console.log(`MoveTo ${user_id} under ${parent.value.id}`)
              let url = `/apiauth/profile/${user_id}/moveto/`;
              return this.$axios.post(url,{"parent_id":parent.value.id})
                .then(response => {
                  if (response.data.result){
                    swalService.showToast("success","MoveTo user successfully! Please refresh page.")
                  }else{
                    swalService.showToast("error","Failed to move user!")
                  }
                })
            }
          })

        }
      })
    },
    ClickNode(data, Node, ev) {
      console.log("ClickNode data", data)
      console.log(data.username, data.id)
      if (data.username !== "" && data.username !== "PINGO.JP" && data.username !== "wavus" && parseInt(data.id)) {
        this.user.username = data.username;
        this.user.id = data.id;
        this.user_selected = true;
      } else {
        this.user.username = "";
        this.user.id = 0;
        this.user_selected = false;
      }
      var list = [];
      if (Node.childNodes.length > 0) {
        list = Node.childNodes.map((node) => {
          return node.data;
        })
      } else {
        list.push(Node.data)
      }
      this.childrenlist = list;
    },
    filterNode(value, data) {
      console.log(data)
      if (!value) return true;
      return data.username.includes(value);
    }
  },
  middleware: ['router-auth', 'router-superadmin'],
}
;
</script>

<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-md-6 col-xs-12">
        <div class="card">
          <div class="card-body">
            <el-tree
              class="filter-tree"
              :props="props"
              :load="loadNode"
              node-key="id"
              @node-click="ClickNode"
              lazy
              :filter-node-method="filterNode"
              ref="tree">
              <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>
          <i class="fe-users text-warning" v-if="!data.leaf"></i>
          <i class="fe-user text-success" v-else></i>
          <i class="ri-alarm-warning-fill text-danger" v-if="data.role==='client_superadmin'"></i>
          {{ node.label }}(#{{ data.user_id }})
        </span>
        <span>
<!--            <el-button-->
          <!--              type="text"-->
          <!--              size="mini"-->
          <!--              @click="() => append(data)">-->
          <!--              Append-->
          <!--            </el-button>-->
          <!--            <a href="javascript:void(0);"-->
          <!--               @click="() => remove_user(data.user_id)" v-if="data.username!=='PINGO.JP' && data.username !=='wavus'">-->
          <!--              Delete-->
          <!--            </a>-->
          </span>
        </span>
            </el-tree>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xs-12" v-if="user_selected">
        <div class="card">
          <div class="card-body">
            <h6>User Selected:{{ user.username }}</h6>
            <div class="d-flex justify-content-between">
              <b-button variant="danger" @click="remove_user(user.id,user.username)">Delete</b-button>
              <b-button variant="primary" @click="user_moveto(user.id,user.username)">MoveTo</b-button>
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
              <div class="col-sm-12 col-md-6">
                <button type="button" class="btn btn-success mb-2 mb-sm-0">
                  <i class="fe-settings"></i>
                </button>
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
                :data="childrenlist"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column
                  type="selection"
                  width="55">
                </el-table-column>

                <el-table-column type="expand">
                  <template slot-scope="props">

                  </template>
                </el-table-column>
                <el-table-column
                  prop="username"
                  label="username">
                  <template slot-scope="scope">{{ scope.row.username }}(#{{ scope.row.user_id }})</template>
                </el-table-column>
                <el-table-column
                  prop="client"
                  label="CA">
                </el-table-column>
                <el-table-column
                  prop="role"
                  width="80"
                  sortable
                  label="Role">
                  <template slot-scope="scope">
                    <button type="button" class="btn btn-rounded ml-1" :class='{
                      "btn-danger":scope.row.role==="superadmin",
                      "btn-primary":scope.row.role==="member",
                      "btn-danger":scope.row.role==="client_superadmin",
                      "btn-warning":scope.row.role==="client_admin",
                      "btn-purple":scope.row.role==="vendor",
                      "btn-success":scope.row.role==="staff",
                      "btn-secondary":scope.row.role===undefined,
                    }' @click="changeUserRole(scope.row)">
                      <i class='fas fa-user-graduate' v-if='scope.row.role==="superadmin"'></i>
                      <i class="ri-alarm-warning-fill" v-if="scope.row.role==='client_superadmin'"></i>
                      <i class='fe-user text-white' v-if='scope.row.role==="member"'></i>
                      <i class='fe-user text-white' v-if='scope.row.role==="staff"'></i>
                      <i class=' ri-home-smile-fill text-white' v-if='scope.row.role==="client_admin"'></i>
                      <i class='ri-hospital-fill text-white' v-if='scope.row.role==="vendor"'></i>
                      <span v-if='scope.row.role===undefined' class="text-white">N/G</span>
                    </button>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="get_descendants_count"
                  align="center"
                  label="follower">
                  <template slot-scope="scope">
                    {{ scope.row.get_descendants_count }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="email">
                  <template slot-scope="scope">{{ scope.row.email }}</template>
                </el-table-column>
                <el-table-column
                  label="status"
                  width="80"
                >
                  <template slot-scope="scope">
                    <ul class="list-inline table-action m-0">
                      <li class="list-inline-item">
                        <i class="fe-mail"
                           v-bind:class="{'text-danger':!scope.row.is_verified,'text-success':scope.row.is_verified}"></i>
                      </li>
                      <li class="list-inline-item">
                        <i
                          v-bind:class="{'fe-x-circle text-danger':!scope.row.is_active,'fe-check-circle text-success':scope.row.is_active}"></i>
                      </li>
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
                        <a href="javascript:void(0);" class="action-icon">
                          <i class="mdi mdi-square-edit-outline"></i></a>
                      </li>
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" class="action-icon" @click="remove_user(scope.row.id)"
                           v-if="scope.row.username!=='wavus'">
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
  </div>
</template>
