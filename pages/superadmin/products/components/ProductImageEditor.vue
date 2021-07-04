<script>
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import {mapGetters} from "vuex";
import {axios} from "@/plugins/axios";

export default {
  name:"admin_product_image_editor",
  props:["product"],
  components: {
    "el-upload": () => import("element-ui/lib/upload"),
    "el-dialog": () => import('element-ui/lib/dialog'),
  },
  data() {
    return {
      image: "",
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
    };
  },
  computed: {
    ...mapGetters({
      back_server: "system/getterBackServer",
    }),
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
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      // const isJPG = true;
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M || !isJPG) {
        this.$message.error('Upload JPG file under 2M!');
      }
      // return isLt2M;
      return isJPG && isLt2M;
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
  },
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
</template>
