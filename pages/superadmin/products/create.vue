<script>
import {
  FormWizard, TabContent, WizardButton
} from "vue-form-wizard";
import vue2Dropzone from "vue2-dropzone";
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2"
import {swalService} from "~/helpers/fakebackend/swal.service"
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import {mapState, mapGetters} from "vuex";
import {axios} from "@/plugins/axios";

/**
 * Product-create component
 */
export default {
  head() {
    return {
      title: `${this.title} | WAVUS PINGO`,
      script: [
        {src: 'https://unpkg.com/element-ui/lib/index.js'}
      ],
      link: [
        {rel: 'stylesheet', href: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'}
      ]
    };
  },
  components: {
    FormWizard,
    TabContent,
    WizardButton,
    Switches: () => import("vue-switches"),
    "el-rate": () => import("element-ui/lib/rate"),
    "el-upload": () => import("element-ui/lib/upload"),
    "el-dialog": () => import("element-ui/lib/dialog"),
    "el-option": () => import("element-ui/lib/option"),
    "el-select": () => import("element-ui/lib/select"),
    "el-cascader": () => import("element-ui/lib/cascader"),
    vueDropzone: vue2Dropzone,
    VariationTable: () => import('../components/VariationTable'),
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
      editorData: "<p>Content of the editor.</p>",
      dropzoneOptions: {
        url: "https://httpbin.org/post",
        thumbnailWidth: 150,
        maxFilesize: 0.5,
        headers: {
          "My-Awesome-Header": "header value",
        },
        previewTemplate: this.template(),
      },
      labels: [
        {value: 'N', label: 'New'},
        {value: 'BS', label: 'Best Seller'}
      ],
      image: "",
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      imageUrl: "",
      modeAdd: false,
      showVariationModal: false,
      edit_variation: {
        price: 0,
        purchase_price: 0,
        name: "",
        description: "",
        point_rule: {
          is_valid: false,
          type: "amount",
          policies: {
            client_superadmin: 0,
            client_admin: 0,
            level_2: 0,
            level_1: 0,
            user_self: 0
          },
          special_promotion: {
            is_valid: false,
            bonus: 0
          }
        },
      },
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
        video_url: "video_url",
        description: "description",
        package: "package",
        category: {id: 0},
        vendor: {id: 0, name: ""}
      }
    };
  },
  computed: {
    ...mapGetters({
      back_server: "system/getterBackServer",
      // categories: "categories/getterCategoryList"
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
    sliderlist() {
      return this.product.sliderimages.map(function (slider) {
        return {url: slider.image, name: slider.http_referer, id: slider.id}
      })
    },
  },
  methods: {
    handleCategoryChange(val) {
      let index = val.length - 1;
      this.product.category.id = val[index]
    },
    template: function () {
      return ` <div class="dropzone-previews mt-3">
            <div class="card mt-1 mb-0 shadow-none border">
                <div class="p-2">
                    <div class="row align-items-center">
                        <div class="col-auto">
                            <img data-dz-thumbnail src="#" class="avatar-sm rounded bg-light" alt="">
                        </div>
                        <div class="col pl-0">
                            <a href="javascript:void(0);" class="text-muted font-weight-bold" data-dz-name></a>
                            <p class="mb-0" data-dz-size></p>
                        </div>
                        <div class="col-auto">
      <a href="" class="btn btn-link btn-lg text-muted" data-dz-remove>
      <i class="fe-x"></i>
      </a>
      </div>
      </div>
      </div>
      </div>
      </div>
      `;
    },
    // isLastStep() {
    //   if (this.$refs.wizard) {
    //     return this.$refs.wizard.isLastStep;
    //   }
    //   return false;
    // },

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
        }
      })
    },
    handleSliderRemove(file) {
      let vm = this;
      console.log(file);
      let url = `/back/store/api/itemsliderimages/${file.id}/`
      axios.$delete(url).then((res) => {
        console.log(res)
        if (res.result) {
          let removeId = parseInt(res.data.sliderimage_id);
          console.log(removeId)
          console.log(vm.product.sliderimages)
          let index = vm.product.sliderimages.findIndex(slider => slider.id === removeId)
          if (index > -1) {
            vm.product.sliderimages.splice(index, 1)
          }
        }
      })

    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleDownload(file) {
      console.log(file);
    },
    beforeAvatarUpload(file) {
      // const isJPG = file.type === 'image/jpeg';
      const isJPG = true;
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isLt2M;
      // return isJPG && isLt2M;
    },
    handlePostImageAvatarSuccess(res, file) {
      console.log(res)
      if (res.result) {
        this.product.image = res.data.product.image;
        this.product.thumbimage = res.data.product.thumbimage;
      }
      // this.postimageUrl = URL.createObjectURL(file.raw);
    },
    handleSlideImageSuccess(res, file) {
      console.log(res)
      if (res.result) {
        res.data.sliderimage.image = this.back_server + res.data.sliderimage.image;

        this.product.sliderimages.push(res.data.sliderimage);
        this.imageUrl = URL.createObjectURL(file.raw);
      }
    },
    switchAddVariationMode() {
      this.modeAdd = true;
      this.showVariationModal = true;
    },
    editVariation(variation) {
      console.log(variation)
      this.edit_variation = variation;
      this.modeAdd = false;
      this.showVariationModal = true;
    },
    updateProductVariationInformation() {
      if (!this.modeAdd) {
        let url = `/back/store/api/variations/${this.edit_variation.id}/`
        var vm = this;
        this.$axios.put(url, {variation: this.edit_variation}).then((response) => {
          if (response.data.result) {
            let variation_server = response.data.data.variation;
            console.log(variation_server)
            var index = vm.product.variations.findIndex(variation => variation.id === variation_server.id)
            console.log(index)
            if (index > -1) {
              vm.product.variations.splice(index, 1, variation_server);
            }
            Swal.fire("Success", "Variation has been updated successfully updated!", "success")
            vm.$bvModal.hide("modal_variation")
          }
        })

      } else {
        let url = `/back/store/api/variations/`
        console.log(this.edit_variation)
        var vm = this;
        this.$axios.post(url, {variation: this.edit_variation, id: this.product.id}).then((response) => {
          console.log(response)
          if (response.data.result) {
            let variation_server = response.data.data.variation;
            vm.product.variations.push(variation_server);
            Swal.fire("Success", "Variation has been added successfully updated!", "success")
            vm.$bvModal.hide("modal_variation")
          }
        })

      }

    },
    deleteVariation(variation_id) {
      let url = `/back/store/api/variations/${variation_id}/`
      var vm = this;
      this.$axios.delete(url).then((response) => {
        console.log(response)
        if (response.data.result) {
          var index = vm.product.variations.findIndex(variation => variation.id === variation_id)
          if (index > -1) {
            vm.product.variations.splice(index, 1);
          }
          Swal.fire("Success", "Variation has been deleted successfully updated!", "success")
          vm.$bvModal.hide("modal_variation")
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
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
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
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="mb-2">
                      Type
                      <span class="text-danger">*</span>
                    </label>
                    <br/>
                    <div class="radio form-check-inline">
                      <input type="radio" v-model="product.type" id="type_Radio1" value="REGULAR"
                             name="radioInline" checked/>
                      <label for="type_Radio1">REGULAR</label>
                    </div>
                    <div class="radio form-check-inline">
                      <input type="radio" v-model="product.type" id="type_Radio2" value="PINGO"
                             name="radioInline"/>
                      <label for="type_Radio2">PINGO</label>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">

                  <div class="form-group mb-3">
                    <label for="product-rate">
                      Rate
                      <span class="text-danger">*</span>
                    </label>
                    <el-rate id="product-rate" v-model="product.rate"></el-rate>

                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">

                  <div class="form-group mb-3">
                    <label for="product-active">
                      Active
                      <span class="text-danger">*</span>
                    </label>
                    <switches v-model="product.is_valid" id="product-active" type-bold="false"
                              color="warning"
                              class="ml-1 my-auto"></switches>
                  </div>
                </div>
                <div class="col-md-6">

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
      </div>
    </div>

    <div class="row" v-if="product.id">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <h4 class="header-title">Product images</h4>
            <p class="sub-header">Upload and change product images</p>

            <div class="row">
              <div class="col-lg-12">
                <el-upload
                  class="avatar-uploader"
                  :action="'/back/store/api/products/'+product.id+'/update_postimage/'"
                  :show-file-list="false"
                  :headers="{'Authorization':csrftoken}"
                  :on-success="handlePostImageAvatarSuccess"
                  :before-upload="beforeAvatarUpload">
                  <img v-if="product.thumbimage" :src="product.thumbimage|https_replace_localhost" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>

              </div>
            </div>
            <div class="row">
              <div class="col-lg-12">
                <div class="row justify-content-start">
                  <div class="col-xl-8">
                    <el-upload
                      action="/back/store/api/itemsliderimages/"
                      list-type="picture-card"
                      ref="upload"
                      :show-file-list="true"
                      :file-list="sliderlist"
                      :before-upload="beforeAvatarUpload"
                      :on-success="handleSlideImageSuccess"
                      :headers="{'Authorization':csrftoken}"
                      :data="{'item_id':product.id}"
                      :auto-upload="true">
                      <i slot="default" class="el-icon-plus"></i>
                      <div slot="file" slot-scope="{file}">
                        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
                        <span class="el-upload-list__item-actions">
                          <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                          <i class="el-icon-zoom-in"></i>
                          </span>
                          <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleDownload(file)">
                            <i class="el-icon-download"></i>

                          </span>
                          <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleSliderRemove(file)">
                            <i class="el-icon-delete"></i>
                          </span>
                        </span>
                      </div>
                    </el-upload>
                    <el-dialog :visible.sync="dialogVisible">
                      <img width="100%" :src="dialogImageUrl" alt="">
                    </el-dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end card -->
      </div>
    </div>

    <VariationTable :variations="product.variations" :product_id="product.id"
                    @operateTable="operateVariationTable" v-if="product.id"></VariationTable>


    <!--    <b-modal id="modal_variation" scrollable title="Edit Variation Information" title-class="font-18"-->
    <!--             body-class="p-4" hide-footer>-->
    <!--      <form @submit.prevent="updateProductVariationInformation">-->
    <!--        <div class="row">-->
    <!--          <div class="col-md-12">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-item_name" class="control-label">Name-->
    <!--                <span class="text-danger">*</span>-->
    <!--              </label>-->
    <!--              <input type="text" id="field-item_name" v-model="edit_variation.name" class="form-control"-->
    <!--                     :class="{ 'is-invalid': submitted && $v.edit_variation.name.$error }"-->
    <!--                     :placeholder="edit_variation.name"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.name.required" class="invalid-feedback">This value is required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="row">-->
    <!--          <div class="col-md-12">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-description" class="control-label">Description<span class="text-danger">*</span></label>-->
    <!--              <textarea id="field-description" v-model="edit_variation.description" class="form-control"-->
    <!--                        :placeholder="edit_variation.description"-->
    <!--                        :class="{ 'is-invalid': submitted && $v.edit_variation.description.$error }"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.description.required" class="invalid-feedback">This value is-->
    <!--                required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="row mt-md-2">-->
    <!--          <div class="col-md-6">-->
    <!--            <b-form-group id="field-is_valid" label-cols="4" label-cols-lg="4" label-size="sm" label="Active">-->
    <!--              <switches v-model="edit_variation.point_rule.is_valid" id="field-is_valid" type-bold="false"-->
    <!--                        color="warning"-->
    <!--                        class="ml-1 my-auto"></switches>-->
    <!--            </b-form-group>-->
    <!--          </div>-->
    <!--        </div>-->

    <!--        <div class="row">-->
    <!--          <div class="col-md-6">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-price" class="control-label">Price-->
    <!--                <span class="text-danger">*</span>-->
    <!--              </label>-->
    <!--              <input type="number" id="field-price" v-model="edit_variation.price" class="form-control"-->
    <!--                     :class="{ 'is-invalid': submitted && $v.edit_variation.price.$error }"-->
    <!--                     :placeholder="edit_variation.price"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.price.required" class="invalid-feedback">This value is-->
    <!--                required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--          <div class="col-md-6">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-price" class="control-label">Purchase Price-->
    <!--                <span class="text-danger">*</span>-->
    <!--              </label>-->
    <!--              <input type="number" id="field-purchase_price" v-model="edit_variation.purchase_price"-->
    <!--                     class="form-control"-->
    <!--                     :class="{ 'is-invalid': submitted && $v.edit_variation.purchase_price.$error }"-->
    <!--                     :placeholder="edit_variation.purchase_price"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.purchase_price.required" class="invalid-feedback">This value is-->
    <!--                required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="row">-->
    <!--          <div class="col-md-6">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-client_admin" class="control-label">{{$t("menuitems.organizations.user.client_superadmin")}}-->
    <!--                <span class="text-danger">*</span>-->
    <!--              </label>-->
    <!--              <input type="number" id="field-client_superadmin" v-model="edit_variation.point_rule.policies.client_superadmin"-->
    <!--                     class="form-control"-->
    <!--                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.client_superadmin.$error }"-->
    <!--                     :placeholder="edit_variation.point_rule.policies.client_superadmin"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.point_rule.policies.client_superadmin.required"-->
    <!--                   class="invalid-feedback">This value is required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--          <div class="col-md-6">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-client_admin" class="control-label">{{$t("menuitems.organizations.user.client_admin")}}-->
    <!--                <span class="text-danger">*</span>-->
    <!--              </label>-->
    <!--              <input type="number" id="field-client_admin" v-model="edit_variation.point_rule.policies.client_admin"-->
    <!--                     class="form-control"-->
    <!--                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.client_admin.$error }"-->
    <!--                     :placeholder="edit_variation.point_rule.policies.client_admin"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.point_rule.policies.client_admin.required"-->
    <!--                   class="invalid-feedback">This value is required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="row">-->
    <!--          <div class="col-md-6">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-level_2" class="control-label">{{$t("menuitems.organizations.user.level_2")}}-->
    <!--                <span class="text-danger">*</span>-->
    <!--              </label>-->
    <!--              <input type="number" id="field-level_2" v-model="edit_variation.point_rule.policies.level_2"-->
    <!--                     class="form-control"-->
    <!--                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.level_2.$error }"-->
    <!--                     :placeholder="edit_variation.point_rule.policies.level_2"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.point_rule.policies.level_2.required" class="invalid-feedback">-->
    <!--                This value is required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--          <div class="col-md-6">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-level_1" class="control-label">{{$t("menuitems.organizations.user.level_1")}}-->
    <!--                <span class="text-danger">*</span>-->
    <!--              </label>-->
    <!--              <input type="number" id="field-level_1" v-model="edit_variation.point_rule.policies.level_1"-->
    <!--                     class="form-control"-->
    <!--                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.level_1.$error }"-->
    <!--                     :placeholder="edit_variation.point_rule.policies.level_1"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.point_rule.policies.level_1.required" class="invalid-feedback">-->
    <!--                This value is required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="row">-->
    <!--          <div class="col-md-6">-->
    <!--            <div class="form-group">-->
    <!--              <label for="field-user_self" class="control-label">{{$t("menuitems.organizations.user.user_self")}}-->
    <!--                <span class="text-danger">*</span>-->
    <!--              </label>-->
    <!--              <input type="number" id="field-user_self" v-model="edit_variation.point_rule.policies.user_self"-->
    <!--                     class="form-control"-->
    <!--                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.user_self.$error }"-->
    <!--                     :placeholder="edit_variation.point_rule.policies.user_self"/>-->

    <!--              <div v-if="submitted && !$v.edit_variation.point_rule.policies.user_self.required" class="invalid-feedback">-->
    <!--                This value is required.-->
    <!--              </div>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div class="form-group row">-->
    <!--          <div class="col-8 offset-4">-->
    <!--            <button type="submit" class="btn btn-primary">Submit</button>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </form>-->

    <!--    </b-modal>-->

    <!-- end row -->
  </div>
</template>
