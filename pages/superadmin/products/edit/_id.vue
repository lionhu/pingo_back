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
    let productDetail = null
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
      console.log(parseInt(this.edit_variation.price) - parseInt(this.edit_variation.purchase_price) - this.introduction_point_total)
      console.log(this.edit_variation.point_rule.special_promotion.is_valid ? this.edit_variation.point_rule.special_promotion.bonus : 0)
      let special_promotion_bonus = this.edit_variation.point_rule.special_promotion.is_valid ? this.edit_variation.point_rule.special_promotion.bonus : 0;

      return parseInt(this.edit_variation.price) - parseInt(this.edit_variation.purchase_price) - this.introduction_point_total - special_promotion_bonus;
    },
    vendorlist() {
      return this.$store.state.system.vendorlist;
    },
    csrftoken() {
      return this.$store.state.auth.user.token;
    },
    sliderlist() {
      return this.product.sliderimages.map(function (slider) {
        return {url: slider.thumbimage_large, name: slider.http_referer, id: slider.id}
      })
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
    handleSliderRemove(file) {
      let vm = this;
      console.log(file);
      let url = `/back/store/api/itemsliderimages/${file.id}/`
      axios.delete(url).then((res) => {
        console.log("remove slider", res)
        if (res.data.result) {
          swalService.showToast("success", "slider image removed successfully!")
          let index = vm.product.sliderimages.findIndex(slider => slider.id === file.id)
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
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M || !isJPG) {
        swalService.showModal("Invalid picture", "Should be JPEG and below 2M", "warning")
        return false
      }
      return isJPG && isLt2M;
      // return isJPG && isLt2M;
    },
    handlePostImageAvatarSuccess(res, file) {
      console.log(res)
      if (res.result) {
        this.product.image = res.data.product.image;
        this.product.thumbimage = res.data.product.thumbimage;
        swalService.showToast("success", "upload successfully!")
      }
    },
    handleVariationImageSuccess(res, file) {
      console.log(res)
      if (res.result) {
        let new_variation = res.data.variation;
        let index = this.product.variations.findIndex(variation => variation.id === new_variation.id)
        if (index > -1) {
          this.product.variations.splice(index, 1, new_variation)
          swalService.showToast("success", "upload successfully!")
        }
      }
    },
    handleSlideImageSuccess(res, file) {
      console.log(res)
      if (res.result) {
        res.data.sliderimage.image = this.back_server + res.data.sliderimage.image;

        this.product.sliderimages.push(res.data.sliderimage);
        this.imageUrl = URL.createObjectURL(file.raw);
      }
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
    getUploadPostimageURL(id) {
      console.log("getUploadPostimageURL", `${process.env.DJANGO_SERVER}/back/store/api/products/${id}/update_postimage/`)
      return `${process.env.DJANGO_SERVER}/back/store/api/products/${id}/update_postimage/`
    },
    getUploadSliderimageURL() {
      console.log(`${process.env.DJANGO_SERVER}/back/store/api/itemsliderimages/`)
      return `${process.env.DJANGO_SERVER}/back/store/api/itemsliderimages/`
    },
    getUploadVariationimageURL(id) {
      return `${process.env.DJANGO_SERVER}/back/store/api/variations/${id}/update_image/`
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
                      <label for="type_Radio1">&nbsp;&nbsp;REGULAR</label>
                    </div>
                    <div class="radio form-check-inline">
                      <input type="radio" v-model="product.type" id="type_Radio2" value="PINGO"
                             name="radioInline"/>
                      <label for="type_Radio2">&nbsp;&nbsp; PINGO</label>
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

                <b-button class="btn-rounded" variant="danger" @click="update_product">Update</b-button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <h4 class="header-title">Product images</h4>
            <p class="sub-header">Upload and change product images</p>

            <div class="row">
              <div class="col-lg-12">
                <el-upload
                  class="avatar-uploader"
                  :action="getUploadPostimageURL(product.id)"
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
                        <img class="el-upload-list__item-thumbnail" :src="file.url|https_replace_localhost" alt="">
                        {{ file.url }}
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
                      <img width="100%" :src="dialogImageUrl|https_media_prefix" alt="">
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
                    @operateTable="operateVariationTable"></VariationTable>

  </div>
</template>
