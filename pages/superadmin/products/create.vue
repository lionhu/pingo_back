<script>
import {swalService} from "~/helpers/fakebackend/swal.service"
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import {mapState, mapGetters} from "vuex";
import {axios} from "@/plugins/axios";

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
    VariationTable: () => import('../components/VariationTable'),
    BasicProductInfo: () => import('./components/BasicProductInfo'),
    ProductImageEditor: () => import('./components/ProductImageEditor'),
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
      modeAdd: false,
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
      }
    };
  },
  computed: {
    ...mapGetters({
      back_server: "system/getterBackServer",
    }),
  },
  methods: {
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
        <BasicProductInfo mode="create" :existed_product="null" @optResult="CreateProductResult"/>
      </div>
    </div>

    <div class="row" v-if="product.id">
      <div class="col-lg-12">
        <ProductImageEditor :product="product"/>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-12">
        <VariationTable :variations="product.variations" :product_id="product.id"
                        @operateTable="operateVariationTable" v-if="product.id"></VariationTable>
      </div>
    </div>
  </div>
</template>
