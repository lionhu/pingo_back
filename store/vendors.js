import {vendorService} from '~/helpers/fakebackend/vendor.service';
import Swal from 'sweetalert2'

export const state = () => ({
  list: []
})
export const actions = {
  load_superadmin_vendorlist({dispatch, commit},options) {
    commit("setVendorList", [])
    vendorService.getAll(options).then(res => {
      if(res.total){
        console.log(res)
        commit("setVendorList", res)
      }
    })
  },
  update_vendor({commit}, vendor) {
    vendorService.updateInfo(vendor).then(res => {
      console.log(res)
      if (res.id) {
        console.log(res)
        commit("updateVendor", res)
        Swal.fire("Success","Vendor Information Updated","success");
      }
    })
  },
  insert_vendor({commit}, vendor) {
    vendorService.insert(vendor).then(res => {
      console.log(res)
      if (res.vendor.id) {
        console.log(res)
        commit("addVendor", res.vendor)
        Swal.fire("Success","Vendor Information Added","success");
      }
    })
  },
  remove_vendor({commit}, vendor_id) {
    vendorService.remove(vendor_id).then(res => {
      console.log(res)
      if (res.vendor_id) {
        console.log(res)
        commit("removeVendor", parseInt(res.vendor_id))
        Swal.fire("Success","Vendor Information Removed","success");
      }
    })
  }
};

export const mutations = {
  setVendorList(state, vendorlist) {
    state.list = vendorlist;
  },
  addVendor(state, vendor) {
    state.list.results.push(vendor);
  },
  updateVendor(state, vendor) {
    const index=state.list.results.findIndex(vendor=>vendor.id===vendor.id)

    if(index>-1){
      state.list.results.splice(index,1,vendor);
    }
  },
  removeVendor(state, vendor_id) {
    console.log(vendor_id)
    const index=state.list.results.findIndex(vendor=>vendor.id===vendor_id)
    console.log(index)
    if(index>-1){
      state.list.results.splice(index,1);
    }
  },
};

