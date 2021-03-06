<script>
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {swalService} from "~/helpers/fakebackend/swal.service"
import {mapState, mapGetters} from "vuex";
import {axios} from "@/plugins/axios";

export default {
  name: "edit_product",
  head() {
    return {
      title: `${this.title} | Pingo Admin`,
      script: [
        {src: 'https://unpkg.com/element-ui/lib/index.js'}
      ],
      link: [
        {rel: 'stylesheet', href: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'}
      ]
    };
  },
  async asyncData({params}) {
    // let productDetail = null
    if (params !== undefined && parseInt(params.id) > 0) {
      let url = `/back/store/api/products/${params.id}/backend_retrieve/`
      let productDetail = await axios.post(url).then((response) => {
        console.log(response)
        if (!response.data.result) {
          window.location.href = "/backend/superadmin/products"
        } else {
          return response.data.data
        }
      })
      return {product: productDetail}
    } else {
      window.location.href = "/backend/superadmin/products"
    }
  },
  components: {
    "el-select": () => import("element-ui/lib/select"),
    "el-rate": () => import("element-ui/lib/rate"),
    "el-dialog": () => import("element-ui/lib/dialog"),
    "el-upload": () => import("element-ui/lib/upload"),
    "el-option": () => import("element-ui/lib/option"),
    "el-cascader": () => import("element-ui/lib/cascader"),
    "el-date-picker": () => import('element-ui/lib/date-picker'),
    Switches: () => import('vue-switches'),
    VariationTable: () => import('../../components/VariationTable'),
    ProductImageEditor: () => import('../components/ProductImageEditor'),
    BasicProductInfo: () => import('../components/BasicProductInfo'),
    ckeditor: CKEditor.component,
  },
  data() {
    return {
      title: "Edit Product",
      items: [
        {
          text: "PINGO",
        },
        {
          text: "eCommerce",
        },
        {
          text: "Edit Product",
          active: true,
        },
      ],
      editor: ClassicEditor,
      // editorData: "<p>Content of the editor.</p>",
      labels: [
        {value: 'N', label: 'New'},
        {value: 'BS', label: 'Best Seller'}
      ],
      image: "",
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      imageUrl: "",
      submitted: false
    };
  },
  computed: {
    ...mapGetters({
      back_server: "system/getterBackServer"
    }),
    ...mapState({
      categories: state => state.system.categories,
    }),
    introduction_point_total() {
      if (this.edit_variation === undefined) {
        return 0;
      }
      return parseInt(this.edit_variation.point_rule.policies.client_superadmin) + parseInt(this.edit_variation.point_rule.policies.client_admin) +
        parseInt(this.edit_variation.point_rule.policies.level_2) + parseInt(this.edit_variation.point_rule.policies.level_1) +
        parseInt(this.edit_variation.point_rule.policies.user_self)
    },
    profit() {
      let special_promotion_bonus = this.edit_variation.point_rule.special_promotion.is_valid ? this.edit_variation.point_rule.special_promotion.bonus : 0;

      return parseInt(this.edit_variation.price) - parseInt(this.edit_variation.purchase_price) - this.introduction_point_total - special_promotion_bonus;
    },
    vendorlist() {
      return this.$store.state.system.vendorlist;
    },
  },
  methods: {
    handleCategoryChange(val) {
      console.log("handleCategoryChange", val)
      let index = val.length - 1;
      this.product.category.id = val[index]
    },
    update_product() {
      this.product.vendor_id = this.product.vendor.id;
      this.product.category_id = this.product.category.id;
      this.product.sort_by = parseInt(this.product.sort_by);
      delete this.product.image;
      delete this.product.thumbimage;
      delete this.product.thumbimage_large;
      delete this.product.sliderimages;

      console.log("new product info ", this.product);

      let url = `/back/store/api/products/${this.product.id}/`
      var vm = this;
      axios.put(url, this.product).then((response) => {
        console.log(response)
        if (response.data.result && response.data.data.product.id) {
          swalService.showModal("Success", "Product was updated!", "success")
        }
      })
    },
    operateVariationTable(result,) {
      console.log(result,)
      switch (result.command) {
        case "addVariation":
          this.AddVariation(result.variation);
          break;
        case "editVariation":
          this.ReplaceVariation(result.variation);
          break;
        case "replaceVariation":
          this.ReplaceVariation(result.variation);
          break;
        case "deleteVariation":
          this.deleteVariation(result.variation);
          break;

      }
    },
    AddVariation(_variation) {
      this.product.variations.push(_variation)
      swalService.showModal("Success", "Variation has been successfully added!", "success")
    },
    ReplaceVariation(_variation) {
      let vm = this;
      var index = vm.product.variations.findIndex(variation => variation.id === _variation.id)
      if (index > -1) {
        vm.product.variations.splice(index, 1, _variation);
        swalService.showModal("Success", "Variation has been successfully updated!", "success")
      }
    },
    deleteVariation(variation_id) {
      let url = `/back/store/api/variations/${variation_id}/`
      var vm = this;
      console.log(url)
      axios.delete(url).then((response) => {
        console.log(response)
        if (response.data.result) {
          var index = vm.product.variations.findIndex(variation => variation.id === variation_id)
          if (index > -1) {
            vm.product.variations.splice(index, 1);
          }
          swalService.showModal("Success", "Variation has been deleted successfully updated!", "success")
          vm.$bvModal.hide("modal_variation")
        }
      })
    },
    CreateProductResult(info) {
      console.log(info)
      if (info.result) {
        this.product = info.product;
      }
    }
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>

<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">

            <h4 class="header-title">General Information(#{{ product.id }})</h4>
            <p class="sub-header">Fill all information below</p>

            <div>
              <div class="row">

                <div class="col-md-4">
                  <div class="form-group mb-3">
                    <label for="product-active">Active<span class="text-danger">*</span></label> <br>
                    <switches v-model="product.is_valid" id="product-active" type-bold="false"
                              color="warning"
                              class="ml-1 my-auto"></switches>
                  </div>
                </div>
                <div class="col-md-2">

                  <div class="form-group mb-3">
                    <label for="product-sort">
                      Sort ID:
                      <span class="text-danger">*</span>
                    </label>
                    <input type="number" v-model="product.sort_by" id="product-sort" class="form-control"
                           :placeholder="product.sort_by"/>
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
                    <label for="product-label">Label<span class="text-danger">*</span></label> <br>
                    <el-select v-model="product.label" placeholder="请选择" id="product-label">
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

                <b-button class="btn-rounded" variant="danger" @click="update_product">Update</b-button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <ProductImageEditor :product="product"/>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <VariationTable :variations="product.variations" :product_id="product.id"
                        @operateTable="operateVariationTable"></VariationTable>
      </div>
    </div>
  </div>
</template>
