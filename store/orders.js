import {orderService} from '@/helpers/fakebackend/order.service';
import {swalService} from '@/helpers/fakebackend/swal.service';
import Swal from 'sweetalert2'
// import {sweetalert} from "~/plugins/sweetalert"

export const state = () => ({
  list: [],
  order: {}
})
export const actions = {
  load_list_superadmin({dispatch, commit}, orderfilter) {

    return new Promise((resolve, reject) => {
      orderService.getAll_superadmin(orderfilter).then(res => {
        resolve(res)
      })
    })

  },
  load_filteredlist_superadmin({dispatch, commit}, orderfilter) {
    orderService.get_FilteredList_superadmin(orderfilter).then(res => {
      let order_count = res.orders.length;
      if (order_count) {
        commit("setList", res.orders)
        swalService.showToast("success", `load ${res.orders.length} orders`)
      } else {
        commit("setList", [])
      }
    })
  },
  getSuperadminFilteredOrderitemList({dispatch, commit}, orderfilter) {
    return new Promise((resolve, reject) => {
      orderService.getSuperadminFilteredOrderitemList(orderfilter).then(res => {
        let orderitem_count = res.orderitems.length;
        if (orderitem_count) {
          resolve(res.orderitems)
        } else {
          resolve([])
        }
      })
    })
  },
  get_vendor_filtered_rrderitem_list({dispatch, commit}, orderfilter) {
    return new Promise((resolve, reject) => {
      orderService.getVendorFilteredOrderitemList(orderfilter).then(res => {
        let orderitem_count = res.orderitems.length;
        if (orderitem_count) {
          resolve(res.orderitems)
        } else {
          resolve([])
        }
      })
    })
  },

  load_order({commit}, order_id) {
    if (order_id) {
      commit("setOrder", order_id)
    }
  },
  updateOrder_superadmin({dispatch, commit}, orderInfo) {
    orderService.updateOrder_superadmin(orderInfo).then(res => {
      console.log(res)
      commit("updateOrder", res.order)
    })
  },
  async updateOrderStatus_superadmin({commit}, orders) {
    const {value: status} = await Swal.fire({
      title: 'Select Status',
      input: 'select',
      inputOptions: {
        'NEW': 'NEW',
        'FINISHED': 'FINISHED'
      },
      inputPlaceholder: 'Select a status',
      showCancelButton: true,
    })

    if (status) {
      var updateinfo = {
        update_fields: ["status"],
        order_ids: orders,
        status: status
      }
      orderService.updateOrder_BATCH_superadmin(updateinfo).then((res) => {
        console.log(res)
        if (res.orders) {
          for (let order of res.orders) {
            commit("updateOrder", order);
            console.log("update order", order.id)
          }
          swalService.showModal(`Status Update! `, `orders: #${JSON.stringify(orders)} <br>  status: ${status} updated!`, "success")
        }
      })
    }
  },

  async updateOrder_PayVendor_BATCH({commit}, updateinfo) {
    return new Promise((resolve, reject) => {
      console.log(updateinfo);
      orderService.updateOrder_BATCH_superadmin(updateinfo).then((res) => {
        if (res.orders) {
          for (let order of res.orders) {
            commit("updateOrder", order);
            console.log("update order", order.id)
          }
          resolve(true)
        }
      })
    });
  },

  async updateOrderItemStatus_superadmin({commit}, updateinfo) {
    const {value: status} = await Swal.fire({
      title: 'Select Status',
      input: 'select',
      inputOptions: {
        'NEW': 'NEW',
        'FINISHED': 'FINISHED'
      },
      inputPlaceholder: 'Select a status',
      showCancelButton: true,
    })

    if (status) {
      updateinfo.status = status;
      console.log(updateinfo)
      orderService.updateOrderItem_superadmin(updateinfo).then((res) => {
        if (res.order) {
          commit("updateOrderItem", res.order);
          swalService.showModal(`Item Status Update! `, `orderitem #${updateinfo.id}  status: ${status} updated!`, "success")
        }
      })
    }
  },

  async updateOrderItemPayment_superadmin({commit}, updateinfo) {
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: ['1', '2', '3']
    }).queue([
      {
        title: 'Question 1',
        text: 'Chaining swal2 modals is easy'
      },
      'Question 2',
      'Question 3'
    ]).then((result) => {
      if (result.value) {
        const answers = JSON.stringify(result.value)
        swalService.showModal({
          title: 'All done!',
          html: `
        Your answers:
        <pre><code>${answers}</code></pre>
      `,
          confirmButtonText: 'Lovely!'
        })
      }
    })


    const {value: status} = await Swal.fire({
      title: 'Select Status',
      input: 'select',
      inputOptions: {
        'NEW': 'NEW',
        'FINISHED': 'FINISHED'
      },
      inputPlaceholder: 'Select a status',
      showCancelButton: true,
    })

    if (status) {
      updateinfo.status = status;
      console.log(updateinfo)
      orderService.updateOrderItem_superadmin(updateinfo).then((res) => {
        if (res.order) {
          commit("updateOrderItem", res.order);
          swalService.showModal(`Item Status Update! `, `orderitem #${updateinfo.id}  status: ${status} updated!`, "success")
        }
      })
    }
  },

  updateOrderItemInfo_superadmin({commit}, updateinfo) {
    return new Promise((resolve, reject) => {
      orderService.updateOrderItem_BATCH_superadmin(updateinfo).then((res) => {
        console.log("order.js updateOrderItemInfo_superadmin", res)
        resolve({orderitems: res.orderitems})
      })
    })
  },

  get_filtered_orderitems_superadmin({commit}, filter_options) {
    return new Promise((resolve, reject) => {
      orderService.getFilteredOrderItems_superadmin(filter_options).then((res) => {
        resolve(res.orderitems)
      })
    })
  },
  removeOrder_superadmin({commit}, order_id) {
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
        orderService.removeOrder_superadmin(order_id).then(response => {
          if (response.id) {
            commit("removeOrder", order_id)
            swalService.showModal('Deleted!', 'Your file has been deleted.', 'success')
          }
        })

      }
    })
  },
  batch_removeOrders_superadmin({commit}, order_ids) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert these orders!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        orderService.batch_removeOrders_superadmin(order_ids).then(response => {

          if (response.ids.length) {
            commit("removeOrders", order_ids)
            swalService.showModal('Deleted!', 'Your file has been deleted.', 'success')
          }
        })

      }
    })
  }
};

export const mutations = {
  setList(state, list) {
    console.log(list)
    if (list !== undefined) {
      list.forEach(order => {
        if (Object.keys(order.point_usage).length) {
          order.point_usage = order.point_usage;
        }
      })
      state.list = list;
    } else {
      state.list = []
    }
  },
  setOrder(state, order_id) {
    console.log(order_id)
    if (state.list) {
      console.log(state.list)
      var order = state.list.find(order => order.id == order_id);
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
    var orderindex = state.list.findIndex(order => order.id == neworder.id);
    if (orderindex > -1) {
      neworder.point_usage = neworder.point_usage;
      state.list.splice(orderindex, 1, neworder);
    }
  },
  removeOrder(state, order_id) {
    var orderindex = state.list.findIndex(order => order.id == order_id);
    if (orderindex > -1) {
      state.list.splice(orderindex, 1);
    }
  },
  removeOrders(state, order_ids) {
    order_ids.forEach(order_id => {
      var orderindex = state.list.findIndex(order => order.id == order_id);
      if (orderindex > -1) {
        state.list.splice(orderindex, 1);
      }
    })
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
