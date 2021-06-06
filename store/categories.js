import {categoryService} from '../helpers/fakebackend/category.service';
import {swalService} from "../helpers/fakebackend/swal.service";
// import Swal from 'sweetalert2'

export const state = () => ({
  list: []
})
export const getters={
  getProductCategories:(state)=>{
    var categories=state.list.find(category=>category.title=="categories")
    if(categories!==undefined) return categories;
    return [];
  },
  getterCategoryList:(state)=>{
    return state.list;
  }
}
export const actions = {
  load_superadmin_categorylist({dispatch, commit}) {
    commit("setList", [])
    categoryService.getAll().then(res => {
      commit("setList", res.categories.children)
    })
  },
  AddCategory({commit}, category) {
    categoryService.insert(category).then(res => {
      commit("setList", res.categories.children)
      swalService.showModal("Success", "Vendor Information Updated", "success")
      // Swal.fire("Success", "Vendor Information Saved", "success");
    })
  },
  updateCategory({commit}, category) {
    categoryService.update(category).then(res => {
      commit("setList", res.categories.children)
      swalService.showModal("Success", "Vendor Information Updated", "success")
      // Swal.fire("Success", "Vendor Information Updated", "success");
    })
  },
  deleteCategory({commit}, category_id) {
    categoryService.remove(category_id).then(res => {
      commit("setList", res.categories.children)
      swalService.showModal("Success", "Vendor Information Updated", "success")
      // Swal.fire("Success", "Vendor Information Updated", "success");
    })
  },
};

export const mutations = {
  setList(state, categories) {
    state.list = categories;
  },
};

