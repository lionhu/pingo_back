<script src="../../../store/vendors.js"></script>
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
    "UserRoleSelector": () => import('../components/UserRoleSelector'),
  },
  data() {
    return {
      title: this.$t("menuitems.organizations.user.text"),
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
      edit_user: {},
      childrenlist: [],
      props: {
        label: 'username',
        children: 'children',
        isLeaf: 'leaf',
        followers: 'get_descendants_count',
        user_id: 0
      },
      targetNodes: [],
      showRoleEditModal: false
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
    closeRoleEditorModal({result, user}) {
      this.showRoleEditModal = false;
      if (result) {
        this.refreshChildrenList(user);
        swalService.showModal('Change Role', 'Role has been changed', 'success')
      }
    },
    changeUserRole(user) {
      console.log("changeUserRole", user)
      this.edit_user = user;
      this.showRoleEditModal = true;
    },
    async setUserTransferPoint(profile) {
      console.log(profile)
      console.log(profile)
      let vm = this;
      const selectOptions = {
        'true': 'Enable',
        "false": "Disable"
      };
      const {value: canTransferPoint} = await Swal.fire({
        title: 'ポイント転送機能',
        input: 'radio',
        inputOptions: selectOptions,
        inputValue: profile.can_transfer_point !== undefined ? profile.can_transfer_point : false,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to choose something!'
          }
        }
      })
      this.updateUserProfileInformation(profile.user_id, {"can_transfer_point": canTransferPoint === 'true'})

    },
    updateUserProfileInformation(user_id, info) {
      let vm = this;
      this.$store.dispatch("users/update_user_profile_information", {
        user_id: user_id,
        info: info
      }).then((response) => {
        console.log("updateUserInformation: ", response)
        vm.refreshChildrenList_canTransferPoint(response, info.can_transfer_point)
        swalService.showModal('Change canTransferPoint', 'canTransferPoint has been changed', 'success')
      })
    },
    refreshChildrenList_canTransferPoint(child_id, canTransferPoint) {
      console.log("child_id, canTransferPoint", child_id, typeof (child_id), canTransferPoint)
      console.log(" this.childrenlist", this.childrenlist)

      var index = this.childrenlist.findIndex(child => child.user_id === parseInt(child_id))
      console.log(index)
      if (index > -1) {
        this.childrenlist[index].can_transfer_point = canTransferPoint;
      }
    },
    refreshChildrenList(user) {
      var index = this.childrenlist.findIndex(child => child.user_id === user.id)
      console.log(index)
      if (index > -1) {
        this.childrenlist.splice(index, 1, user);
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
        text: `All ${username}'s (#${user_id}) information will be deleted. `,
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
              console.log(vm.childrenlist)
              var index = vm.childrenlist.findIndex(profile => profile.user_id === user_id)
              console.log(index)
              if (index > -1) {
                vm.childrenlist.splice(index, 1)
                Swal.fire("Success", "success", "User removed successfully! Please Refresh Page")
              }
            }
          });
        }
      })
    },
    user_moveto(user_id, username) {
      console.log(user_id)
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
          console.log("parentID",parentID)
          if (parseInt(parentID)!==1){
            let url = `/apiauth/profile/${parentID}/validate_userid/`;
          return this.$axios.post(url)
            .then(response => {
              console.log("response data", response.data)
              if (!response.data.result) {
                throw new Error(`Username (#${user_id}) does not exist!`)
              }
              return response.data.user
            })
            .catch(error => {
              Swal.showValidationMessage(
                `Parent (#${parentID}) does not exist!`
              )
            })
          }else{
            Swal.showValidationMessage(
                "Cannot move under Pingo.JP!"
              )
          }

        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        let parent = result;
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Are you sure?',
            text: `MoveTo ${username}(#${user_id}) under ${parent.value.username}(#${parent.value.id})`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, move it!'
          }).then((result) => {
            if (result.isConfirmed) {
              let url = `/apiauth/profile/${user_id}/moveto/`;
              return this.$axios.post(url, {"parent_id": parent.value.id})
                .then(response => {
                  if (response.data.result) {
                    swalService.showToast("success", "MoveTo user successfully! Please refresh page.")
                  } else {
                    swalService.showToast("error", "Failed to move user!")
                  }
                })
            }
          })

        }
      })
    },
    ClickNode(data, Node, ev) {
      console.log("ClickNode data", data)
      console.log(data.username, data.user_id)
      if (data.username !== "" && data.username !== "PINGO.JP" && data.username !== "wavus" && parseInt(data.id)) {
        this.user.username = data.username;
        this.user.id = data.user_id;
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
            <h6>{{ $t("menuitems.organizations.user.selected_user") }}:{{ user.username }}</h6>
            <div class="d-flex justify-content-between">
              <b-button variant="primary" @click="user_moveto(user.id,user.username)">
                {{ $t("menuitems.organizations.user.move_user") }}
              </b-button>
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
                    <h6>User ID: {{ props.row.user_id }}</h6>
                    <h6>Email: {{ props.row.email }}</h6>
                    <ul>
                      <li v-for="role in props.row.roles" :key="role">{{ role }}</li>
                    </ul>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="username"
                  label="username">
                  <template slot-scope="scope">{{ scope.row.username }}</template>
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
                    <b-button variant="primary" @click="changeUserRole(scope.row)" v-b-modal:modal-user-roles-selector>
                      <i class='fe-user text-white'></i>
                    </b-button>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="can_transfer_point"
                  align="center"
                  label="ポイント転送">
                  <template slot-scope="scope">
                    <button type="button" class="btn btn-rounded ml-1" @click="setUserTransferPoint(scope.row)"
                            v-bind:class="{'btn-success':scope.row.can_transfer_point,'btn-danger':!scope.row.can_transfer_point}">
                      <i class="fe-refresh-cw"></i>
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
                        <a href="javascript:void(0);" class="action-icon"
                           @click="remove_user(scope.row.user_id,scope.row.username)"
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
    <UserRoleSelector :user="edit_user" @closeModal="closeRoleEditorModal" :showModal="showRoleEditModal"/>
  </div>
</template>
