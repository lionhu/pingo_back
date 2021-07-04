import {axios} from '@/plugins/axios.js';
import {swalService} from './swal.service'

export const productService = {
  getAll,
  getCategoryProducts,
  updateInfo,
  insert,
  remove
};
const urls = {
  "list": "/back/store/api/products/backend_list/",
  "update": "/back/store/api/products/"
}

function getAll(options) {
  let url = urls.list;
  if (options) {
    url = `${url}${options}`
  }
  return axios.$get(url)
    .then(handleResponse)
    .then(response => {
      return response;
    });
}
function getCategoryProducts(options) {
  let url = urls.list;
  return axios.$post(url,{filterOptions:options})
    .then(handleResponse)
    .then(response => {
      return response;
    });
}

function updateInfo(info) {
  console.log("updateInfo",info)
  if (info.id) {
    let url = `${urls.update}${info.id}/`
    return axios.$put(url, info)
      .then(handleResponse)
      .then(response => {
        return response;
      });
  }
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

function handleResponse(response) {
  if (response === undefined || response.status === 401) {
    const loggeduser = localStorage.getItem('user');
    if (!loggeduser) {
      window.location.href = "/backend/account/login"
    } else {
      location.reload(true);
    }
  }else if (!response.result) {
    const error = response.message || response.statusText;
    swalService.showModal('Error', response.message,'error')
    return Promise.reject(error);
  }
  return response.data;
}
