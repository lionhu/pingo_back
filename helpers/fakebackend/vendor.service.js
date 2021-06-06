import {axios} from '@/plugins/axios.js';
import Swal from 'sweetalert2'

export const vendorService = {
  getAll,
  updateInfo,
  insert,
  remove
};
const urls = {
  "list": "/back/store/api/vendors/",
}

function getAll(options) {
  let url = urls.list;
  if (options) {
    url = `${url}${options}`
  }
  console.log(url)
  return axios.$get(url)
    .then(handleResponse)
    .then(response => {
      return response;
    });
}

function updateInfo(info) {
  if (info.id) {
    let url = `${urls.list}${info.id}/`
    return axios.$put(url,info)
      .then(handleResponse)
      .then(response => {
        console.log(response)
        return response;
      });
  }
}
function insert(info) {
    return axios.$post(urls.list,info)
      .then(handleResponse)
      .then(response => {
        console.log(response)
        return response;
      });
}
function remove(vendor_id) {
  let url=`${urls.list}${vendor_id}/`
    return axios.$delete(url)
      .then(handleResponse)
      .then(response => {
        console.log(response)
        return response;
      });
}

// function setUserRole({user_id,role}) {
//   const url=`/apiauth/users/${user_id}/set_user_role/`
//     return axios.$post(url,{user_id,role})
//       .then(handleResponse)
//       .then(response=>{
//         return response;
//       });
// }
function handleResponse(response) {
  console.log(response)
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
    Swal.fire(
      'Error',
      response.message,
      'error'
    )
    return Promise.reject(error);
  }
  console.log(response.data)
  return response.data;
}


// function handleResponse(response) {
//   console.log(response)
//   if (!response.result) {
//     if (response.status === 401) {
//       logout();
//       location.reload(true);
//     }
//     const error = response.message || response.statusText;
//       Swal.fire(
//         'Error',
//         response.message,
//         'error'
//       )
//     return Promise.reject(error);
//   }
//   return response.data;
// }
