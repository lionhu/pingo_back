import {systemService} from '../helpers/fakebackend/system.service';

export const state = () => ({
  // backend_server: 'https://www.pingo.jp',
  menuitems: [],
  categories: [],
  vendorlist: [],
  sidebar_menuitems: [],
  back_server: process.env.DJANGO_SERVER
})
export const actions = {
  get_system_info({commit}) {
    systemService.system_info()
      .then(response => {
        commit('init', response);
      });
  },
};

export const mutations = {
  init(state, response) {
    state.vendorlist = response.vendorlist;
    state.menuitems = response.menuitems.children;
    if (response.menuitems.children.length) {
      // state.sidebar_menuitems = state.menuitems.find(item => item.title === "menuitems.text").children
      state.categories = state.menuitems.find(menuitem => menuitem.title === "CATEGORIES(ROOT)").children
    }
  },
};

export const getters = {
  getterVendorList: (state) => {
    return state.vendorlist;
  },
  getterBackServer: (state) => {
    return state.back_server;
  },
  getCategories: (state) => {
    let categories = state.menuitems.find(menuitem => menuitem.title === "categories").children
    return categories
  },
  vendorSelectOptions: (state) => {
    return state.vendorlist.map((vendor) => {
      return {value: vendor.id, label: vendor.name}
    })
  }
};

