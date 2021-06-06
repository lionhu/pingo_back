import {productService} from '../helpers/fakebackend/product.service';

export const state = () => ({
  list: [],
  product: {}
})
export const actions = {
  load_list({dispatch, commit}, options) {
    commit("setList", [])
    productService.getAll(options).then(res => {
      commit("setList", res)
    })
  },
  load_category_products({dispatch, commit}, filterOptions) {
    return new Promise((resolve, reject) => {
      productService.getCategoryProducts(filterOptions).then(res => {
        resolve(res)
      })
    })
  },
  update_productinfo({commit}, productInfo) {
    return new Promise((resolve, reject) => {
      productService.updateInfo(productInfo).then(res => {
        if (res.product.id) {
          resolve(res.product)
        }
      })
    })
  },
};

export const mutations = {
  setList(state, list) {
    state.list = list;
  },
  setProduct(state, product) {
    state.product = product;
  },
  updateProduct(state, _product) {
    const index = state.list.results.findIndex(product => product.id === _product.id)
    if (index > -1) {
      state.list.results.splice(index, 1, _product);
    }
  },
};

