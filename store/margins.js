import {marginService} from '@/helpers/fakebackend/margin.service';
import Swal from 'sweetalert2'

export const state = () => ({
  list: {},
  margin: {}
})
export const actions = {
  updateMargin_superadmin({dispatch, commit}, marginInfo) {
    return new Promise((resolve, reject) => {
      marginService.updateMargin_superadmin(marginInfo).then(res => {
        resolve(res)
      })
    })
  },
  batch_updateMargin_superadmin({dispatch, commit}, marginInfo) {
    console.log(marginInfo)
    return new Promise((resolve, reject) => {
      marginService.batchupdateMargin_superadmin(marginInfo).then(res => {
        console.log(res)
        resolve(res)
      })
    })
  },

  removeMargin_superadmin({commit}, margin_id) {
    return new Promise((resolve, reject) => {
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
          marginService.deleteMargin_superadmin(margin_id)
            .then(response => {
              resolve(response.id)
            })
        }
      })
    })
  },
}

export const mutations = {
  setList(state, list) {
    console.log(list.results)
    if (list.results !== undefined) {
      list.results.forEach(order => {
        order.point_usage = JSON.parse(order.point_usage);
        // order.payment_info = JSON.parse(order.payment_info);
        // console.log(JSON.parse(order.payment_info))
      })
      state.list = list;
    } else {
      state.list = {}
    }
  },
  setOrder(state, order_id) {
    console.log(order_id)
    if (state.list.results) {
      console.log(state.list.results)
      var order = state.list.results.find(order => order.id == order_id);
      console.log(order)
      console.log(order.payment_info)
      // order.payment_info = JSON.parse(order.payment_info);
      state.order = order
      console.log(state.order)
    } else {
      state.order = {}
    }
  },
  updateOrderItem(state, order) {
    order.point_usage = JSON.parse(order.point_usage);
    // order.payment_info = JSON.parse(order.payment_info);
    state.order = order
  },
  updateOrder(state, neworder) {
    var orderindex = state.list.results.findIndex(order => order.id == neworder.id);
    if (orderindex > -1) {
      neworder.point_usage = JSON.parse(neworder.point_usage);
      // neworder.payment_info = JSON.parse(neworder.payment_info);
      state.list.results.splice(orderindex, 1, neworder);
    }
  },
  removeOrder(state, order_id) {
    var orderindex = state.list.results.findIndex(order => order.id == order_id);
    if (orderindex > -1) {
      state.list.results.splice(orderindex, 1);
    }
  }
};

export const getters = {
  // getCategory: (state) => (id) => {
  //   return state.todos.find(todo => todo.id === id)
  // }
  gettersSuperadminOrderList: (state) => {
    return state.list;
  },
  gettersSuperadminOrder: (state) => {
    return state.order;
  }
};
