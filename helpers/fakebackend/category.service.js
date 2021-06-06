import {axios} from '@/plugins/axios.js';
import {swalService} from "~/helpers/fakebackend/swal.service";

export const categoryService = {
  getAll,
  update,
  insert,
  remove
};
const urls = {
  "list": "/back/store/api/categories/",
}

function getAll() {
  return axios.$get(urls.list)
    .then(handleResponse)
    .then(response => {
      return response;
    });
}

function  remove(category_id) {
  let url=`${urls.list}${category_id}/`

  return axios.$delete(url)
    .then(handleResponse)
    .then(response => {
      return response;
    });
}
function update(category) {
  let url=`${urls.list}${category.id}/`
  return axios.$put(url,category)
    .then(handleResponse)
    .then(response => {
      return response;
    });
}

function insert(category) {
    return axios.$post(urls.list,category)
      .then(handleResponse)
      .then(response => {
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
  }
  if (!response.result) {
    const error = response.message || response.statusText;
    swalService.showModal('Error',response.message,'error')
    return Promise.reject(error);
  }
  return response.data;
}
