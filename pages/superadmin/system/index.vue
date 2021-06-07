<script>
import {mapGetters} from "vuex"

export default {
  head() {
    return {
      title: `${this.title} | Admin Dashboard`,
    };
  },
  components: {
    Category: () => import('./components/Category'),
    PointPolicy: () => import('./components/PointPolicy'),
  },
  data() {

    return {
      title: "vendors",
      items: [
        {
          text: "PINGO"
        },
        {
          text: "eCommerce"
        },
        {
          text: "Vendors",
          active: true
        }
      ],
    };
  },
  computed: {
    ...mapGetters({
      // menuitems_store: "categories/getterCategoryList"
    }),
  },
  mounted() {
    // this.$store.dispatch("categories/load_superadmin_categorylist")
  },
  methods: {
  },
  middleware: ['router-auth', 'router-superadmin']
};
</script>
<style>
.line-title-width {
  min-width: 45px !important;
}
</style>
<template>
  <div>
    <PageHeader :title="title" :items="items"/>
    <Category/>
    <PointPolicy/>
<!--    <div class="row mb-2">-->
<!--      <div class="col-sm-6">-->
<!--        <a href="javascript:void(0);" class="btn btn-danger mb-2" @click="show_addnew"><i-->
<!--          class="mdi mdi-plus-circle mr-1"></i> Add Category-->
<!--        </a>-->
<!--      </div>-->
<!--      <div class="col-sm-6">-->
<!--        <div class="float-sm-right">-->
<!--          <button type="button" class="btn btn-success mb-2 mb-sm-0">-->
<!--            <i class="fe-settings"></i>-->
<!--          </button>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="row">-->
<!--      <div class="col-12">-->
<!--        <div class="card">-->
<!--          <div class="card-body">-->
<!--            <div class="row mb-2">-->
<!--              <div class="col-sm-6">-->
<!--                <el-tree-->
<!--                  :data="menuitems_store"-->
<!--                  :accordion="true"-->
<!--                  highlight-current-->
<!--                  :props="defaultProps"-->
<!--                  node-key="id"-->
<!--                  default-expand-all-->
<!--                  @node-click="NodeSelected"-->
<!--                  :expand-on-click-node="false">-->
<!--                  <span class="custom-tree-node" slot-scope="{ node, data }">-->
<!--                  <span>{{ node.label }}</span>-->
<!--                  <span>-->
<!--                    <el-button-->
<!--                      type="text"-->
<!--                      size="mini"-->
<!--                      @click="() => edit_node(data)" v-if="data.id!==1 && data.id!==2">-->
<!--                      Edit-->
<!--                    </el-button>-->
<!--                    <el-button-->
<!--                      type="text"-->
<!--                      size="mini"-->
<!--                      @click="() => deleteCategory(data)" v-if="data.id!==1 && data.id!==2">-->
<!--                      Delete-->
<!--                    </el-button>-->
<!--                  </span>-->
<!--                </span>-->
<!--                </el-tree>-->
<!--              </div>-->

<!--              <div class="col-sm-6" v-if="mode==='edit' ||mode==='add'">-->
<!--                <h5 v-if="mode==='edit'">ID: {{ menuitem.id }}</h5>-->
<!--                <switches v-model="test_switch" id="tests" theme="bootstrap" color="warning"-->
<!--                          class="ml-1 my-auto"></switches>-->
<!--                <b-form-group id="fieldset-title" label-cols="4" label-cols-lg="2" label-size="sm" label="Text">-->
<!--                  <b-form-input id="title" v-model="menuitem.title"></b-form-input>-->
<!--                </b-form-group>-->
<!--                <b-form-group id="fieldset-parent" label-cols="4" label-cols-lg="2" label-size="sm" label="ParentID"-->
<!--                              v-if="mode==='add'">-->
<!--                  <b-form-input id="parent" v-model="menuitem.parent"></b-form-input>-->
<!--                </b-form-group>-->
<!--                <b-form-group id="fieldset-link" label-cols="4" label-cols-lg="2" label-size="sm" label="Link">-->
<!--                  <b-form-input id="link" v-model="menuitem.link"></b-form-input>-->
<!--                </b-form-group>-->
<!--                <b-button variant="primary" @click="updateCategory" v-if="mode==='edit'">Updata</b-button>-->
<!--                <b-button variant="primary" @click="addCategory" v-if="mode==='add'">Save</b-button>-->
<!--              </div>-->

<!--              &lt;!&ndash; end col&ndash;&gt;-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>
