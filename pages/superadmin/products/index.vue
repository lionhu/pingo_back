<script>
import {mapGetters, mapState} from "vuex"
import {swalService} from "@/helpers/fakebackend/swal.service"
import {axios} from "@/plugins/axios";
import Swal from "sweetalert2";


const empty_product = {
  id: 0,
  item_name: "",
  is_valid: false,
  rate: 0,
  vendor: {
    id: 0,
    name: ""
  },
  category: {
    id: 0,
    title: ""
  },
  type: "",
  pingo_currentNum: 0,
  pingo_targetNum: 10,
  pingo_until_at: ""
};
export default {
  name: "product_list",
  head() {
    return {
      title: `${this.title} | PINGO`,
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
    "el-date-picker": () => import('element-ui/lib/date-picker'),
    "el-table": () => import('element-ui/lib/table'),
    "el-table-column": () => import('element-ui/lib/table-column'),
    "el-select": () => import('element-ui/lib/select'),
    "el-rate": () => import('element-ui/lib/rate'),
    "el-dialog": () => import('element-ui/lib/dialog'),
    "el-upload": () => import('element-ui/lib/upload'),
    "el-option": () => import('element-ui/lib/option'),
    "el-cascader": () => import('element-ui/lib/cascader'),
    "el-form": () => import('element-ui/lib/form'),
    Category:()=>import('../components/CategoryModal')

  },
  data() {
    return {
      title: "Products List",
      items: [
        {text: "PinGo"},
        {text: "eCommerce"},
        {text: "Products List", active: true}
      ],
      submitted: false,
      product: empty_product,
      searchproduct: {
        item_name: "",
        id: 0
      },
      productlist: [],
      search_product_key: "",
      props: {
        label: 'title',
        children: 'children',
        isLeaf: 'leaf',
        user_id: 0
      },
      dropdown_props: {
        label: "title",
        value: "id"
      },
      edit_category:false
    };
  },
  computed: {
    ...mapGetters({
      categorylist: "categories/getterCategoryList"
    }),
    ...mapState({
      vendorlist: state => state.system.vendorlist,
      backend_server: state => state.system.backend_server
    }),
  },
  mounted() {
  },
  methods: {
    getImageUrl(path) {
      return this.backend_server + path
    },
    handleSelect_category(item) {
      this.product.category.id = item.id;
    },
    querySearchAsync_category(queryString, cb) {
      this.product.category = {id: 0, title: ""};
      let url = `/back/store/api/categories/backend_list/?search=${queryString}`
      this.$axios.post(url).then((response) => {
        if (response.data.result && response.data.categories) {
          var selectlist = response.data.categories.map(function (category) {
            return {id: category.id, value: category.title}
          })
          cb(selectlist)
        }
      })
    },
    handleVendorChange(value) {
      console.log(value);
    },
    handleSelect_product(item) {
      this.searchproduct = item;
    },
    querySearchAsync_product(queryString, cb) {
      this.searchproduct = {};
      this.search_results = [];
      var vm = this;
      let url = `/back/store/api/products/backend_list/?search=${queryString}`
      this.$axios.post(url).then((response) => {
        if (response.data.result && response.data.data.results) {
          var selectlist = response.data.data.results.map(function (product) {
            return {id: product.id, value: product.item_name}
          })
          vm.search_results = response.data.data.results;
          cb(selectlist)
        }
      })
    },
    updateProductInformation() {
      let vm = this;
      this.product.vendor_id = this.product.vendor.id
      this.product.category_id = this.product.category.id
      this.product.pingo_targetNum = parseInt(this.product.pingo_targetNum)
      this.product.pingo_currentNum = parseInt(this.product.pingo_currentNum)
      console.log(this.product)
      this.$store.dispatch("products/update_productinfo", this.product)
        .then((res_product) => {
          console.log(res_product)
          let index = vm.productlist.findIndex(product => product.id === res_product.id);
          if (index > -1) {
            vm.productlist.splice(index, 1, res_product);
            swalService.showToast("success", "Updated successfully!")
          }
        })
      this.$bvModal.hide("modal-product")
      this.product = empty_product;
    },
    editProduct(product) {
      console.log(product)
      this.product = empty_product;
      this.product.id = product.id;
      this.product.is_valid = product.is_valid;
      this.product.type = product.type;
      this.product.pingo_until_at = product.pingo_until_at;
      this.product.pingo_targetNum = product.pingo_targetNum;
      this.product.pingo_currentNum = product.pingo_currentNum;
      this.product.item_name = product.item_name;
      this.product.rate = product.rate;
      this.product.vendor.id = product.vendor.id;
      this.product.category.id = product.category.id;
      this.product.category.title = product.category.title;
      this.$bvModal.show("modal-product")
    },
    deleteProduct(product_id) {
      console.log(product_id)
      let vm = this;
      if (product_id) {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert delete product!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.isConfirmed) {
            axios.$post(`/back/store/api/products/${product_id}/RemoveProduct_superadmin/`)
              .then(response => {
                console.log(response)
                if (response.result) {
                  let index = vm.productlist.findIndex(_product => _product.id == product_id)
                  console.log(index)
                  if (index > -1) {
                    vm.productlist.splice(index, 1)
                    swalService.showToast("success", "product removed successfully!")
                  }
                }
              }).catch(err => {
              console.log(err)
              swalService.showToast("error", "Something wrong when removing product!")
            })
          }
        })
      }
    },
    ClickNode(data, Node, ev) {
      if (Node.isLeaf) {
        var filterOptions = {"category_id": Node.data.id};
        this.load_filtered_products(filterOptions)
      }
    },
    SearchProducts() {
      if (this.search_product_key !== "") {
        var filterOptions = {"item_name__icontains": this.search_product_key};
        this.load_filtered_products(filterOptions)
      }
    },
    load_filtered_products(options) {
      let vm = this;
      this.$store.dispatch("products/load_category_products", options)
        .then(response => {
          vm.productlist = response.products;
          let product_count=response.products.length;
          if(product_count){
          swalService.showToast("success",`${product_count} products loaded!`)
          }else{
            swalService.showToast("warning",`no products found!`)
          }
        })
    },
    handleCategoryChange(values) {
      this.product.category.id = values[values.length - 1];
    },
    switchProductType(varType) {
      this.product.type = varType;
    }
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>

<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-md-6 col-xs-12">
        <div class="card">
          <div class="card-body">
<!--            <h6 style="line-height: 2rem;">Product Category-->
<!--                <b-button variant="warning" class="float-right" @click="edit_category=!edit_category;">Edit</b-button>-->
<!--            </h6>-->
            <el-tree
              class="filter-tree"
              :props="props"
              :data="categorylist"
              node-key="id"
              draggable
              @node-click="ClickNode"
              ref="tree">
            </el-tree>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xs-12">
        <div class="card" v-if="edit_category">
          <div class="card-body">
            <Category />
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

                <nuxt-link to="/superadmin/products/create" class="btn btn-danger mb-2"><i
                  class="mdi mdi-plus-circle mr-1"></i> Add Products
                </nuxt-link>
              </div>
              <div class="col-sm-6">
                <div class="form-group row mb-0">
                  <div class="col-sm-12">
                    <div class="input-group">
                      <input type="text" class="form-control" placeholder="product name" v-model="search_product_key"
                             aria-describedby="basic-addon2"/>
                      <div class="input-group-append">
                        <button class="btn btn-dark waves-effect waves-light" type="button" @click="SearchProducts">
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div><!-- end col-->
            </div>
            <div class="table-responsive mb-0">

              <el-table
                :data="productlist"
                style="width: 100%">
                <el-table-column type="expand">
                  <template slot-scope="props">
                    <el-form label-position="left" inline class="demo-table-expand">
                      <div class="row">
                        <div class="col-12">
                          <ul>
                            <li v-for="variant in props.row.variations_admin">
                              <ul class="list-inline">
                                <li class="list-inline-item">{{ variant.name }}</li>
                                <li class="list-inline-item">{{ variant.purchase_price |currency("¥") }}</li>
                                <li class="list-inline-item">{{ variant.price |currency("¥") }}</li>
                              </ul>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </el-form>
                  </template>
                </el-table-column>
                <el-table-column width="250" label="Product" sortable prop="id">
                  <template slot-scope="scope">
                    <div v-if="scope.row.thumbimage">
                      <img :src="scope.row.thumbimage|https_replace_localhost" alt=""
                           class="rounded mr-3" style="width: 60%;"/>
                    </div>
                    <div v-if="!scope.row.thumbimage" class="avatar-xs d-inline-block mr-2">
                      <div class="avatar-title bg-soft-primary rounded-circle text-primary">
                        <i class="mdi mdi-account-circle m-0"></i>
                      </div>
                    </div>
                    <h5 class="m-0 d-inline-block align-middle">
                      {{ scope.row.item_name }}(#{{ scope.row.id }})
                    </h5>
                    <h6>
                      <a href="javascript:void(0);" @click="editProduct(scope.row)" class="action-icon">
                        <b-badge variant="primary" pill v-if="scope.row.type==='REGULAR'">REGULAR</b-badge>
                        <b-badge variant="warning" pill v-else>Pingo</b-badge>
                        <i class="mdi mdi-square-edit-outline"></i>
                      </a>
                    </h6>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Vendor"
                  sortable
                  prop="vendor.name">
                </el-table-column>
                <el-table-column
                  label="Rate"
                  sortable
                  prop="rate">
                  <template slot-scope="scope">
                            <span class="badge" :class="{
                      'badge-success': scope.row.rate >= 4,
                      'badge-danger': scope.row.rate < 3,
                      'badge-warning':
                        scope.row.rate > 3 && scope.row.rate < 4
                    }"><i class="mdi mdi-star"></i> {{ scope.row.rate }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Category"
                  sortable
                  prop="category.title">
                </el-table-column>
                <el-table-column
                  label="Status"
                  sortable
                  prop="is_valid">
                  <template slot-scope="scope">
                    <b-badge variant="success" pill v-if="scope.row.is_valid">active</b-badge>
                    <b-badge variant="danger" pill v-else>deactivate</b-badge>
                  </template>
                </el-table-column>

                <el-table-column
                  label="Action">
                  <template slot-scope="scope">
                    <ul class="list-inline table-action m-0">
                      <li class="list-inline-item">
                        <a :href="`https://www.pingo.jp/shop/preview/${scope.row.id}`" target="_blank"  class="action-iconk">
                          <i class="fe-eye text-danger"></i></a>
                      </li>
                      <li class="list-inline-item">
                        <nuxt-link :to="'/superadmin/products/edit/' + scope.row.id" class="action-iconk">
                          <i class="fe-edit"></i></nuxt-link>
                      </li>
                      <li class="list-inline-item">
                        <nuxt-link :to='{name:"superadmin-products-create___jp",params:{product:scope.row}}' class="action-iconk">
                          <i class="ri-file-copy-2-fill"></i></nuxt-link>
                      </li>
                      <li class="list-inline-item">
                        <a href="javascript:void(0);" class="action-iconk" @click="deleteProduct(scope.row.id)">
                          <i class="fe-trash-2"></i>
                        </a>
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
    <b-modal id="modal-product" scrollable title="Edit Product Information" title-class="font-18"
             body-class="p-4" hide-footer>
      <form @submit.prevent="updateProductInformation">
        <div class="row">
          <div class="col-md-6">
            <b-form-group id="field-type_regular">
              <b-form-radio v-model="product.type" name="some-radios" value="REGULAR"
                            @change="switchProductType('REGULAR')">REGULAR
              </b-form-radio>
            </b-form-group>
          </div>
          <div class="col-md-6" id="field-type_pingo">
            <b-form-group>
              <b-form-radio v-model="product.type" name="some-radios" value="PINGO"
                            @change="switchProductType('PINGO')">PINGO
              </b-form-radio>
            </b-form-group>
          </div>
        </div>
        <div class="row" v-if="product.type==='PINGO'">
          <div class="col-md-4">
            <div class="form-group">
              <label for="field-targetNum" class="control-label">TargetNum
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-targetNum" v-model="product.pingo_targetNum" class="form-control"
                     :placeholder="product.pingo_targetNum"/>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label for="field-currentNum" class="control-label">CurrentNum
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-currentNum" v-model="product.pingo_currentNum" class="form-control"
                     :placeholder="product.pingo_currentNum"/>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label id="fromDate_picker_label">
                Until At:
                <span class="text-danger">*</span>
              </label>
              <el-date-picker
                id="fromDate_picker"
                v-model="product.pingo_until_at"
                align="right"
                type="date"
                placeholder="開始日選択">
              </el-date-picker>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <b-form-group id="field-is_valid" label-cols="4" label-cols-lg="4" label-size="sm" label="Active">
              <switches v-model="product.is_valid" id="field-is_valid" type-bold="false" color="warning"
                        class="ml-1 my-auto"></switches>
            </b-form-group>
          </div>
          <div class="col-md-6">
            <b-form-group id="field-rate" label-cols="4" label-cols-lg="4" label-size="sm" label="Rate">
              <el-rate v-model="product.rate"></el-rate>
            </b-form-group>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label for="field-item_name" class="control-label">Name
                <span class="text-danger">*</span>
              </label>
              <input type="text" id="field-item_name" v-model="product.item_name" class="form-control"
                     :class="{ 'is-invalid': submitted && $v.product.item_name.$error }"
                     :placeholder="product.item_name"/>

              <div v-if="submitted && !$v.product.item_name.required" class="invalid-feedback">This value is required.
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="control-label">Vendor<span class="text-danger">*</span></label>
              <el-select v-model="product.vendor.id" placeholder="请选择">
                <el-option
                  v-for="item in vendorlist"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>


            </div>
          </div>
          <div class="col-md-6">
            <label class="control-label">Category<span class="text-danger">*</span></label>
            <el-cascader
              :options="categorylist.children"
              :props="dropdown_props"
              @change="handleCategoryChange"></el-cascader>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-8 offset-4">
            <button type="submit" class="btn btn-primary">Submit</button>
            <!--            <button type="reset" class="btn btn-secondary m-l-5 ml-1">Cancel</button>-->
          </div>
        </div>
      </form>

    </b-modal>
  </div>
</template>
