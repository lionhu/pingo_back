<script>
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2"
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import {mapState, mapGetters} from "vuex";

export default {
  name:"admin_create_product_basicinfo",
  props:["mode","existed_product"],
  mounted() {
    if (this.existed_product!==null){
      this.product=this.existed_product;
      this.product.description="";
      this.product.package="";
    }
  },
  components: {
    Switches: () => import("vue-switches"),
    "el-rate": () => import("element-ui/lib/rate"),
    "el-upload": () => import("element-ui/lib/upload"),
    "el-dialog": () => import("element-ui/lib/dialog"),
    "el-option": () => import("element-ui/lib/option"),
    "el-select": () => import("element-ui/lib/select"),
    "el-cascader": () => import("element-ui/lib/cascader"),
    ckeditor: CKEditor.component,
  },
  data() {
    return {
      editor: ClassicEditor,
      labels: [
        {value: 'N', label: 'New'},
        {value: 'BS', label: 'Best Seller'}
      ],
      disabled: false,
      modeAdd: false,
      submitted: false,
      product: {
        id: 0,
        item_name: "item_name",
        type: "REGULAR",
        rate: 4,
        is_valid: false,
        label: "N",
        brand: "brand",
        series: "series",
        model: "model",
        image: "",
        sort_by: 0,
        video_url: "video_url",
        description: "description",
        package: "package",
        category: {id: 0},
        vendor: {id: 0, name: ""}
      },
      errors: []
    };
  },
  computed: {
    ...mapGetters({
      back_server: "system/getterBackServer",
    }),
    ...mapState({
      categories: state => state.system.categories,
    }),
    vendorlist() {
      return this.$store.state.system.vendorlist;
    },
    csrftoken() {
      return this.$store.state.auth ? this.$store.state.auth.user.token : "";
    },
  },
  methods: {
    handleCategoryChange(val) {
      let index = val.length - 1;
      this.product.category.id = val[index]
    },
    pre_check() {
      this.errors = [];
      if (this.product.vendor.id === 0) {
        this.errors.push("Vendor is empty")
      }
      if (this.product.category.id === 0) {
        this.errors.push("Category is empty")
      }
      return this.errors.length

    },
    update_product() {
      this.product.vendor_id = this.product.vendor.id;
      this.product.category_id = this.product.category.id;

      let url = `/back/store/api/products/${this.product.id}/`
      var vm = this;
      this.$axios.put(url, this.product).then((response) => {
        console.log(response)
        if (response.data.result && response.data.data.product.id) {
          vm.product = response.data.data.product
          Swal.fire("Success", "Product was updated!", "success")
        }
      })
    },
    create_product() {
      if (this.pre_check()) {
        Swal.fire("error", this.errors)
      } else {
        this.product.vendor_id = this.product.vendor.id;
        this.product.category_id = this.product.category.id;
        delete this.product.vendor;
        delete this.product.category;
        delete this.product.image;


        let url = `/back/store/api/products/`
        var vm = this;
        console.log("create new product", this.product)
        this.$axios.post(url, this.product).then((response) => {
          console.log(response)
          if (response.data.result && response.data.data.product.id) {
            vm.product = response.data.data.product;
            Swal.fire("Success", "Product was created!", "success")
            vm.$emit("optResult",{result:true,product:response.data.data.product})
          }
        })
      }

    },
  },
};
</script>

<template>
  <div class="card">
    <div class="card-body">

      <h4 class="header-title">General Information(#{{ product.id }})</h4>
      <p class="sub-header">Fill all information below</p>

      <div>
        <div class="row">
          <div class="col-md-4">

            <div class="form-group mb-3">
              <label for="product-sort">
                Sort ID:
                <span class="text-danger">*</span>
              </label>
              <input type="number" v-model="product.sort_by" id="product-sort" class="form-control"
                     :placeholder="product.sort_by"/>
            </div>
          </div>
          <div class="col-md-4">

            <div class="form-group mb-3">
              <label for="product-active">
                Active
                <span class="text-danger">*</span>
              </label><br>
              <switches v-model="product.is_valid" id="product-active" type-bold="false"
                        color="warning"
                        class="ml-1 my-auto"></switches>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4">
            <div class="form-group mb-3">
              <label for="product-rate">
                Rate
                <span class="text-danger">*</span>
              </label>
              <el-rate id="product-rate" v-model="product.rate"></el-rate>
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-group mb-3">
              <label for="product-category">
                Label
                <span class="text-danger">*</span>
              </label>
              <el-select v-model="product.label" placeholder="请选择">
                <el-option
                  v-for="item in labels"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">

            <div class="form-group mb-3">
              <label for="product-category">
                Categories
                <span class="text-danger">*</span>
              </label>
              <el-cascader
                id="product-category"
                v-model="product.category.id"
                :options="categories"
                size="medium"
                :props="{ expandTrigger: 'hover',multiple:false,label:'title',value:'id'}"
                @change="handleCategoryChange"></el-cascader>
            </div>
          </div>
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
        </div>
        <div class="row mb-3">
          <div class="col-md-4">

            <label for="product-brand">
              Brand
              <span class="text-danger">*</span>
            </label>
            <input type="text" v-model="product.brand" id="product-brand" class="form-control"
                   :placeholder="product.brand"/>
          </div>
          <div class="col-md-4">

            <label for="product-Series">
              Series
              <span class="text-danger">*</span>
            </label>
            <input type="text" v-model="product.series" id="product-Series" class="form-control"
                   :placeholder="product.series"/>
          </div>
          <div class="col-md-4">

            <label for="product-model">
              Model
              <span class="text-danger">*</span>
            </label>
            <input type="text" v-model="product.model" id="product-model" class="form-control"
                   :placeholder="product.model"/>
          </div>
        </div>
        <div class="form-group mb-3">
          <label for="product-name">
            Product Name
            <span class="text-danger">*</span>
          </label>
          <input type="text" v-model="product.item_name" id="product-name" class="form-control"
                 placeholder="e.g : Apple iMac"/>
        </div>
        <div class="form-group mb-3">
          <label for="product-video_url">
            Video URL
            <span class="text-danger">*</span>
          </label>
          <input type="text" v-model="product.video_url" id="product-video_url" class="form-control"
                 placeholder="e.g : Apple iMac"/>
        </div>
        <div class="form-group mb-3">
          <label for="product-description">
            Product Description
            <span class="text-danger">*</span>
          </label>
          <ckeditor id="product-description" v-model="product.description" :editor="editor"></ckeditor>
        </div>
        <div class="form-group mb-3">
          <label>Package</label>

          <ckeditor id="product-package" v-model="product.package" :editor="editor"></ckeditor>
        </div>
        <div class="form-group mt-3 float-right">
          <b-button class="btn-rounded" variant="warning" @click="update_product" v-if="product.id">Update
          </b-button>
          <b-button class="btn-rounded" variant="danger" @click="create_product" v-else>Save</b-button>
        </div>
      </div>
    </div>
  </div>
</template>
