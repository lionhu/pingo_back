<script>
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {swalService} from "~/helpers/fakebackend/swal.service"
import {mapState, mapGetters} from "vuex";
import {axios} from "@/plugins/axios";

export default {
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
      modeAdd: false,
      edit_variation: {
        price: 0,
        purchase_price: 0,
        name: "",
        description: "",
        variation_type: "",
        inventory: 0,
        point_rule: {
          is_valid: false,
          type: "amount",
          policies: {
            client_superadmin: 0,
            client_admin: 0,
            level_2: 0,
            level_1: 0,
            user_self:0
          }
        },
      },
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
      console.log("handleCategoryChange",val)
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
        let index = this.product.variations_admin.findIndex(variation => variation.id === new_variation.id)
        if (index > -1) {
          this.product.variations_admin.splice(index, 1, new_variation)
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
    switchAddVariationMode() {
      this.modeAdd = true;
      this.$bvModal.show("modal_variation")
    },
    editVariation(variation) {
      console.log(variation)
      this.edit_variation = variation;
      this.modeAdd = false;
      this.$bvModal.show("modal_variation")
    },
    updateProductVariationInformation() {
      if (!this.modeAdd) {
        let url = `/back/store/api/variations/${this.edit_variation.id}/`
        var vm = this;
        delete this.edit_variation.image;

        axios.put(url, {variation: this.edit_variation}).then((response) => {
          if (response.data.result) {
            let variation_server = response.data.data.variation;
            console.log(variation_server)
            var index = vm.product.variations_admin.findIndex(variation => variation.id === variation_server.id)
            console.log(index)
            if (index > -1) {
              vm.product.variations_admin.splice(index, 1, variation_server);
            }
            swalService.showModal("Success", "Variation has been updated successfully updated!", "success")
            vm.$bvModal.hide("modal_variation")
          }
        })

      } else {
        let url = `/back/store/api/variations/`
        console.log(this.edit_variation)
        var vm = this;
        axios.post(url, {variation: this.edit_variation, id: this.product.id}).then((response) => {
          console.log(response)
          if (response.data.result) {
            let variation_server = response.data.data.variation;
            vm.product.variations_admin.push(variation_server);
            swalService.showModal("Success", "Variation has been added successfully updated!", "success")
            vm.$bvModal.hide("modal_variation")
          }
        })

      }

    },
    deleteVariation(variation_id) {
      let url = `/back/store/api/variations/${variation_id}/`
      var vm = this;
      axios.delete(url).then((response) => {
        console.log(response)
        if (response.data.result) {
          var index = vm.product.variations_admin.findIndex(variation => variation.id === variation_id)
          if (index > -1) {
            vm.product.variations_admin.splice(index, 1);
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
    }
  },
  middleware: "router-auth",
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
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">Available Variations</div>
              <div class="col-md-6">
                <button class="btn btn-danger mb-2 float-right" @click="switchAddVariationMode"><i
                  class="mdi mdi-plus-circle mr-1"></i> Add Variation
                </button>
              </div>
            </div>
            <div class="row">
              <div class="table-responsive">
                <table class="table table-bordered table-centered mb-0">
                  <thead class="thead-light">
                  <tr>
                    <th>name</th>
                    <th>description</th>
                    <th>Inventory</th>
                    <th>price</th>
                    <th>point_rule</th>
                    <th></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="variation in product.variations_admin">
                    <td class="text-center">
                      {{ variation.name }} <br>
                      <b-badge variant="primary" pill v-if="variation.variation_type==='REGULAR'">REGULAR</b-badge>
                      <b-badge variant="warning" pill v-else>Pingo</b-badge>

                      <el-upload
                        class="avatar-uploader"
                        :action="getUploadVariationimageURL(variation.id)"
                        :show-file-list="false"
                        :headers="{'Authorization':csrftoken}"
                        :on-success="handleVariationImageSuccess"
                        :before-upload="beforeAvatarUpload">
                        <img v-if="variation.thumbimage" :src="variation.thumbimage|https_replace_localhost"
                             class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                      </el-upload>
                    </td>
                    <td>{{ variation.description.substr(0, 50) + "..." }}</td>
                    <td  class="text-center">{{variation.inventory}}</td>
                    <td class="text-right">
                      <span class="d-block">{{ variation.price|currency("¥") }}</span>
                      <span class="d-block">{{ variation.purchase_price|currency("¥") }}</span>
                    </td>
                    <td class="text-right">
                      <h5>
                        <b-badge variant="success" pill v-if="variation.point_rule.is_valid">on</b-badge>
                        <b-badge variant="danger" pill v-else>off</b-badge>
                      </h5>
                      <ul style="list-style-type: none;">
                        <li>
                          <span class="inline-block text-right mr-3">{{$t("menuitems.organizations.user.client_superadmin")}}:</span>
                          {{variation.point_rule.policies.client_superadmin|currency("¥")}}
                        </li>
                        <li>
                          <span class="inline-block text-right mr-3">{{$t("menuitems.organizations.user.client_admin")}}:</span>
                          {{variation.point_rule.policies.client_admin|currency("¥")}}
                        </li>
                        <li>
                          <span
                            class="inline-block text-right mr-3">{{$t("menuitems.organizations.user.level_2")}}:</span>{{
                            variation.point_rule.policies.level_2|currency("¥")
                          }}
                        </li>
                        <li>
                          <span
                            class="inline-block text-right mr-3">{{$t("menuitems.organizations.user.level_1")}}:</span>{{
                            variation.point_rule.policies.level_1|currency("¥")
                          }}
                        </li>
                        <li>
                          <span
                            class="inline-block text-right mr-3">{{$t("menuitems.organizations.user.user_self")}}:</span>{{
                            variation.point_rule.policies.user_self|currency("¥")
                          }}
                        </li>
                      </ul>
                    </td>
                    <td class="align-items-center">
                      <a href="javascript:void(0);" @click="editVariation(variation)" class="action-icon">
                        <i class="fe-edit"></i></a>
                      <a href="javascript:void(0);" @click="deleteVariation(variation.id)" class="action-icon">
                        <i class="fe-trash"></i></a>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- end card -->
        </div>
      </div>
      <!-- end row -->
    </div>

    <b-modal id="modal_variation" scrollable title="Edit Variation Information" title-class="font-18"
             body-class="p-4" hide-footer>
      <form @submit.prevent="updateProductVariationInformation">
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label for="field-item_name" class="control-label">Name
                <span class="text-danger">*</span>
              </label>
              <input type="text" id="field-item_name" v-model="edit_variation.name" class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.name.$error }"
                     :placeholder="edit_variation.name"/>

              <div v-if="submitted && !$v.edit_variation.name.required" class="invalid-feedback">This value is required.
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="form-group">
              <label for="field-description" class="control-label">Description<span class="text-danger">*</span></label>
              <textarea id="field-description" v-model="edit_variation.description" class="form-control"
                        :placeholder="edit_variation.description"
                        :class="{ 'is-invalid': submitted && $v.edit_variation.description.$error }"/>

              <div v-if="submitted && !$v.edit_variation.description.required" class="invalid-feedback">This value is
                required.
              </div>
            </div>
          </div>
        </div>
        <div class="row mt-md-2">
          <div class="col-md-6">
            <label for="field-inventory" class="control-label">Active
              <span class="text-danger">*</span>
            </label>
          </div>
          <div class="col-md-6">

            <div class="form-group">
              <switches v-model="edit_variation.point_rule.is_valid" id="field-is_valid" type-bold="false"
                        color="warning"
                        class="ml-1 my-auto"></switches>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="field-inventory" class="control-label">Inventory
                <span class="text-danger">*</span>
              </label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <input type="number" id="field-inventory" v-model="edit_variation.inventory" class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.price.$error }"
                     :placeholder="edit_variation.inventory"/>

              <div v-if="submitted && !$v.edit_variation.inventory.required" class="invalid-feedback">This value is
                required.
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-md-2">

          <div class="col-md-6">
            <label class="mb-2">Type<span class="text-danger">*</span></label>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <div class="radio form-check-inline ml-md-2">
                <input type="radio" v-model="edit_variation.variation_type" id="variation_type_Radio1" value="REGULAR"
                       name="radioInline" checked/>
                <label for="type_Radio1">REGULAR</label>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <div class="radio form-check-inline">
                <input type="radio" v-model="edit_variation.variation_type" id="variation_type_Radio2" value="PINGO"
                       name="radioInline"/>
                <label for="type_Radio2">PINGO</label>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="field-price" class="control-label">Price
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-price" v-model="edit_variation.price" class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.price.$error }"
                     :placeholder="edit_variation.price"/>

              <div v-if="submitted && !$v.edit_variation.price.required" class="invalid-feedback">This value is
                required.
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="field-price" class="control-label">Purchase Price
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-purchase_price" v-model="edit_variation.purchase_price"
                     class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.purchase_price.$error }"
                     :placeholder="edit_variation.purchase_price"/>

              <div v-if="submitted && !$v.edit_variation.purchase_price.required" class="invalid-feedback">This value is
                required.
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="field-client_admin" class="control-label">{{$t("menuitems.organizations.user.client_superadmin")}}
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-client_superadmin" v-model="edit_variation.point_rule.policies.client_superadmin"
                     class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.client_superadmin.$error }"
                     :placeholder="edit_variation.point_rule.policies.client_superadmin"/>

              <div v-if="submitted && !$v.edit_variation.point_rule.policies.client_superadmin.required"
                   class="invalid-feedback">This value is required.
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="field-client_admin" class="control-label">{{$t("menuitems.organizations.user.client_admin")}}
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-client_admin" v-model="edit_variation.point_rule.policies.client_admin"
                     class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.client_admin.$error }"
                     :placeholder="edit_variation.point_rule.policies.client_admin"/>

              <div v-if="submitted && !$v.edit_variation.point_rule.policies.client_admin.required"
                   class="invalid-feedback">This value is required.
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="field-level_2" class="control-label">{{$t("menuitems.organizations.user.level_2")}}
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-level_2" v-model="edit_variation.point_rule.policies.level_2"
                     class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.level_2.$error }"
                     :placeholder="edit_variation.point_rule.policies.level_2"/>

              <div v-if="submitted && !$v.edit_variation.point_rule.policies.level_2.required" class="invalid-feedback">
                This value is required.
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="field-level_1" class="control-label">{{$t("menuitems.organizations.user.level_1")}}
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-level_1" v-model="edit_variation.point_rule.policies.level_1"
                     class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.level_1.$error }"
                     :placeholder="edit_variation.point_rule.policies.level_1"/>

              <div v-if="submitted && !$v.edit_variation.point_rule.policies.level_1.required" class="invalid-feedback">
                This value is required.
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="field-user_self" class="control-label">{{$t("menuitems.organizations.user.user_self")}}
                <span class="text-danger">*</span>
              </label>
              <input type="number" id="field-user_self" v-model="edit_variation.point_rule.policies.user_self"
                     class="form-control"
                     :class="{ 'is-invalid': submitted && $v.edit_variation.point_rule.policies.user_self.$error }"
                     :placeholder="edit_variation.point_rule.policies.user_self"/>

              <div v-if="submitted && !$v.edit_variation.point_rule.policies.user_self.required" class="invalid-feedback">
                This value is required.
              </div>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-8 offset-4">
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </form>

    </b-modal>

    <!-- end row -->
  </div>
</template>
