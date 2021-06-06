<script>
import {mapGetters, mapState} from "vuex"
import {swalService} from "@/helpers/fakebackend/swal.service"
import Swal from 'sweetalert2'
import {axios} from "@/plugins/axios";
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
  name: "faqs_list",
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
    "el-collapse-item": () => import('element-ui/lib/collapse-item'),
    "el-collapse": () => import('element-ui/lib/collapse'),
    ckeditor: CKEditor.component,
  },
  data() {
    return {
      title: "Products List",
      items: [
        {text: "PinGo"},
        {text: "eCommerce"},
        {text: "Products List", active: true}
      ],
      faqs: [],
      faq: {},
      faq_mode: "add",
      sections: [],
      section: {
        id: 0,
        title: "",
        index: 0,
        is_valid: false
      },
      section_mode: "add",
      Faq_CRUD_URL: '/back/store/api/faqs/',
      Section_CRUD_URL: '/back/store/api/sections/',
      editor: ClassicEditor,
      editorData: "<p>Content of the editor.</p>",
    };
  },
  computed: {
    ...mapGetters({
      // categorylist: "categories/getProductCategories"
    }),
    ...mapState({
      backend_server: state => state.system.backend_server
    }),
  },
  mounted() {
    this.load_sections();
  },
  methods: {
    reset_faq() {
      this.faq = {
        id: 0,
        question: "",
        answer: "",
        index: 0,
        is_valid: false
      }
    },
    reset_section() {
      this.section = {
        id: 0,
        title: "",
        index: 0,
        is_valid: false
      }
    },
    load_sections() {
      let vm = this;
      axios.get(this.Section_CRUD_URL).then((response) => {
        if (response.data.result) {
          vm.sections = response.data.data.sections;
        }
      })
    },
    showModalSection(mode, section) {
      this.section_mode = mode;
      if (mode === 'edit') {
        this.section = section;
      } else {
        this.reset_section();
      }
      this.$bvModal.show("modelSection")
    },
    RemoveSection(section_id) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          let vm = this;
          axios.delete(this.Section_CRUD_URL + section_id + "/").then((response) => {
            if (response.data.result) {
              let edit_section_index = vm.sections.findIndex(section => section.id === section_id);
              if (edit_section_index > -1) {
                vm.sections.splice(edit_section_index, 1);
                swalService.showToast("success", "Section was deleted!")
                vm.$bvModal.hide("modelSection")
              }
            }
          })
        }
      })
    },
    AddOrUpdateSection() {
      let vm = this;
      if (this.section.title !== '') {
        if (this.section_mode === "add") {
          delete this.section.id;
          axios.post(this.Section_CRUD_URL, this.section).then((response) => {
            if (response.data.result) {
              vm.sections.push(response.data.data.section)
              swalService.showToast("success", "News section was added")
              vm.$bvModal.hide("modelSection")
            }
          })
        } else {
          axios.put(this.Section_CRUD_URL + vm.section.id + "/", vm.section).then((response) => {
            if (response.data.result) {
              let edit_section_index = vm.sections.findIndex(section => section.id === vm.section.id);
              if (edit_section_index > -1) {
                vm.sections.splice(edit_section_index, 1, response.data.data.section);
                swalService.showToast("success", "News section was updated!")
                vm.$bvModal.hide("modelSection")
              }
            }
          })
        }
      }
    },
    showModalFaq(mode, section, faq) {
      this.faq_mode = mode;
      if (mode === 'edit') {
        this.faq = faq;
      } else {
        this.reset_faq();
      }
      this.faq.section_id = section.id;
      this.$bvModal.show("modelFaq");
    },
    AddOrUpdateFaq() {
      let vm = this;
      if (vm.faq.question !== '' && vm.faq.answer !== '') {
        if (vm.faq_mode === "add") {
          delete vm.faq.id;
          axios.post(vm.Faq_CRUD_URL, vm.faq).then((response) => {
            if (response.data.result) {
              let updated_section = vm.sections.find(section => section.id === vm.faq.section_id);
              if (updated_section) {
                updated_section.faqs.push(response.data.data.faq)
              }
              swalService.showToast("success", "New faq was added")
              vm.$bvModal.hide("modelFaq")
            }
          })
        } else {
          axios.put(vm.Faq_CRUD_URL + vm.faq.id + "/", vm.faq).then((response) => {
            if (response.data.result) {
              let updated_section_index = vm.sections.findIndex(section => section.id === vm.faq.section_id)
              let edit_faq_index = vm.sections[updated_section_index].faqs.findIndex(faq => faq.id === vm.faq.id)
              if (edit_faq_index > -1) {
                vm.sections[updated_section_index].faqs.splice(edit_faq_index, 1, response.data.data.faq);
                swalService.showToast("success", "Faq was updated!")
                vm.$bvModal.hide("modelFaq")
              }
            }
          })
        }
      }
    },
    removeFAQ(section_id, faq_id) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          let vm = this;
          axios.delete(this.Faq_CRUD_URL + faq_id + "/").then((response) => {
            if (response.data.result) {
              let updated_section_index = vm.sections.findIndex(section => section.id === section_id)
              let edit_faq_index = vm.sections[updated_section_index].faqs.findIndex(faq => faq.id === faq_id)
              if (edit_faq_index > -1) {
                vm.sections[updated_section_index].faqs.splice(edit_faq_index, 1);
                swalService.showToast("success", "Faq was updated!")
                vm.$bvModal.hide("modelFaq")
              }
            }
          })
        }
      })
    }
  },
  middleware: ['router-auth', 'router-superadmin'],
};
</script>

<template>
  <div>
    <PageHeader :title="title" :items="items"/>

    <div class="row mb-3">
      <div class="col-12 text-right">
        <b-button variant="warning" @click="showModalSection('add',null)">Add Section</b-button>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card" v-for="section in sections" :key="section.id">
          <div class="card-header  ribbon-box d-flex justify-content-between">

            <div class="ribbon ribbon-purple float-left">
              {{ section.index }} <i :class="{'fe-eye':section.is_valid,'fe-eye-off':!section.is_valid}"></i>
            </div>
            <div class="inline-block">
              {{ section.title }}
              <a href="javascript:void(0);" class="inline-block" @click="showModalSection('edit',section)">
                <i class="fe-edit"></i>
              </a>
            </div>

            <b-button variant="danger"><i class="fe-trash" @click="RemoveSection(section.id)"></i>
            </b-button>
          </div>
          <div class="card-body">
            <h4 class="text-right">
              <b-button variant="success">
                <i class="fe-plus-circle" @click="showModalFaq('add',section,null)"></i>
              </b-button>
            </h4>
            <el-collapse accordion>
              <el-collapse-item v-for="faq in section.faqs" :key="faq.id">
                <template slot="title">
                  <b-badge variant="primary" pill class="mr-3">{{ faq.index }}<i :class="{'fe-eye':faq.is_valid,'fe-eye-off':!faq.is_valid}"></i></b-badge>
                  <div v-html="faq.question"></div>
                </template>
                <div v-html="faq.answer"></div>
                <div class="d-flex justify-content-between mt-5">
                  <b-button variant="success"><i class="fe-trash" @click="removeFAQ(section.id,faq.id)"></i></b-button>
                  <b-button variant="primary"><i class="fe-edit" @click="showModalFaq('edit',section,faq)"></i>
                  </b-button>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>


    <b-modal id="modelSection" scrollable :title="this.section_mode==='edit'?'edit':'add'" title-class="font-18"
             body-class="p-4" hide-footer>
      <div class="card">
        <div class="card-body">
          <form>
            <div class="form-row">
              <b-form-group class="col-md-6" label="is_valid" label-for="section_is_valid">
                <input id="section_is_valid" v-model="section.is_valid" type="checkbox"/>
              </b-form-group>
              <b-form-group class="col-md-6" label="index" label-for="section_index">
                <b-form-input type="text" id="section_index" v-model="section.index"></b-form-input>
              </b-form-group>
            </div>

            <b-form-group label="Title" label-for="section_title">
              <b-form-input type="text" id="section_title" v-model="section.title"></b-form-input>
            </b-form-group>
          </form>
        </div>
        <div class="card-footer">
          <b-button variant="primary" @click="AddOrUpdateSection">Submit</b-button>
        </div>
      </div>

    </b-modal>
    <b-modal id="modelFaq" size="lg" scrollable title="Edit Faq Information" title-class="font-18"
             body-class="p-4" hide-footer>

      <div class="card">
        <div class="card-body">
          <form>
            <div class="form-row">
              <b-form-group class="col-md-6" label="is_valid" label-for="faq_is_valid">
                <input id="faq_is_valid" v-model="faq.is_valid" type="checkbox"/>
              </b-form-group>
              <b-form-group class="col-md-6" label="index" label-for="faq_index">
                <b-form-input type="text" id="faq_index" v-model="faq.index"></b-form-input>
              </b-form-group>
            </div>

            <b-form-group label="Question" label-for="faq_question">
              <b-form-input type="text" id="faq_question" v-model="faq.question"></b-form-input>
            </b-form-group>
            <b-form-group label="Answer" label-for="faq_answer">
              <ckeditor id="faq_answer" v-model="faq.answer" :editor="editor"></ckeditor>
            </b-form-group>
          </form>
        </div>
        <div class="card-footer">
          <b-button variant="primary" @click="AddOrUpdateFaq">Submit</b-button>
        </div>
      </div>

    </b-modal>

  </div>
</template>
