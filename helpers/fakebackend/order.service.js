import {axios} from '@/plugins/axios.js';

export const orderService = {
  getAll_superadmin,
  get_FilteredList_superadmin,
  updateOrder_superadmin,
  updateOrder_BATCH_superadmin,
  removeOrder_superadmin,
  batch_removeOrders_superadmin,

  updateOrderItem_BATCH_superadmin,
  getFilteredOrderItems_superadmin,

  getSuperadminFilteredOrderitemList
};
const urls = {
  "superadmin_list": "/back/store/api/orders_superadmin/",
  "superadmin_filtered_list": "/back/store/api/orders_superadmin/filtered_list/",
  "superadmin_orderupdate_batch": "/back/store/api/orders_superadmin/update_batch/",
  "superadmin_removeorders_batch": "/back/store/api/orders_superadmin/destory_list/",
  "superadmin_orderitem": "/back/store/api/orderitems_superadmin/",
  "superadmin_filter_orderitemlist": "/back/store/api/orderitems_superadmin/filtered_list/",
  "superadmin_orderitem_update_batch": "/back/store/api/orderitems_superadmin/update_batch/"
}

function getSuperadminFilteredOrderitemList(orderfilter) {
  let url = urls.superadmin_filter_orderitemlist;
  console.log(orderfilter)
  return axios.$post(url,{filters:orderfilter})
    .then(handleResponse)
    .then(response => {
      return response;
    });
}
function get_FilteredList_superadmin(orderfilter) {
  let url = urls.superadmin_filtered_list;
  console.log(orderfilter)
  return axios.$post(url,{filters:orderfilter})
    .then(handleResponse)
    .then(response => {
      return response;
    });
}

function getAll_superadmin(orderfilter) {
  let url = urls.superadmin_list;
  if (orderfilter) {
    url = `${url}?status=${orderfilter.status}&from_date=${orderfilter.from_date}`
  }
  console.log(url)
  return axios.$get(url)
    .then(handleResponse)
    .then(response => {
      return response;
    });
}

function updateOrder_superadmin(info) {
  if (info.id) {
    let url = `${urls.superadmin_list}${info.id}/`
    delete info.id;
    return axios.$put(url, {update_info: info})
      .then(handleResponse)
      .then(response => {
        return response;
      });
  }
}

function updateOrder_BATCH_superadmin(info) {
  if (info.order_ids && info.order_ids.length) {
    let url = urls.superadmin_orderupdate_batch;
    return axios.post(url, info)
      // .then(handleResponse)
      .then(response => {
        // return response;
        if (response.data.result) {
          return response.data.data;
        }
        return Promise.reject(error);
      });
  }
}

function batch_removeOrders_superadmin(order_ids) {
  if (order_ids && order_ids.length) {
    let url = urls.superadmin_removeorders_batch;
    return axios.post(url, {
      "order_ids":order_ids
    }).then(response => {
        // return response;
        if (response.data.result) {
          return response.data.data;
        }
        return Promise.reject(error);
      });
  }
}

function removeOrder_superadmin(order_id) {
  let url = `${urls.superadmin_list}${order_id}/`
  console.log(url)
  return axios.$delete(url)
    .then(handleResponse)
    .then(response => {
      return response;
    });
}

function updateOrderItem_BATCH_superadmin(info) {
  console.log(info)
  let url = urls.superadmin_orderitem_update_batch;
  return axios.post(url, info)
    // .then(handleResponse)
    .then(response => {
      if (response.data.result) {
        return response.data.data;
      }
      return Promise.reject(error);
    });

}

function getFilteredOrderItems_superadmin(filter_options) {
  console.log(filter_options)
  let url = `${urls.superadmin_orderitem}filtered_list/`;
  return axios.post(url, {"filters": filter_options})
    // .then(handleResponse)
    .then(response => {
      // return response;
      if (response.data.result) {
        return response.data.data;
      }
      return Promise.reject(error);
    });
}


function insert(info) {
  return axios.$post(urls.list, info)
    .then(handleResponse)
    .then(response => {
      console.log(response)
      return response;
    });
}

function remove(product_id) {
  let url = `${urls.update}product_id`
  return axios.$delete(url)
    .then(handleResponse)
    .then(response => {
      console.log(response)
      return response;
    });
}


// OrderItem related
function updateOrderItem_superadmin(info) {
  if (info.id) {
    let url = `${urls.superadmin_orderitem}${info.id}/`
    return axios.$put(url, {update_info: info})
      .then(handleResponse)
      .then(response => {
        return response;
      });
  }
}


function handleResponse(response) {
  if (response === undefined || response.status === 401) {
    const loggeduser = localStorage.getItem('user');
    if (!loggeduser) {
      window.location.href = "/backend/account/login"
    } else {
      location.reload(true);
    }
  }
  if (!response.result) {
    const error = response.message || response.statusText;
    // Swal.fire('Error', response.message,'error')
    console.log(error)
    return Promise.reject(error);
  }
  return response.data;
}
