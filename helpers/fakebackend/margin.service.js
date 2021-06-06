import {axios} from '@/plugins/axios.js';

export const marginService = {
  updateMargin_superadmin,
  batchupdateMargin_superadmin,
  deleteMargin_superadmin
};
const urls = {
  "superadmin_margin": "/back/store/api/margins/",
  "superadmin_margin_batchUpdate": "/back/store/api/margins/update_batch/",
}

function batchupdateMargin_superadmin(info) {
    let url = urls.superadmin_margin_batchUpdate;
    return axios.$post(url, {update_info: info})
      .then(handleResponse)
      .then(response => {
        return response;
      });
}


function updateMargin_superadmin(info) {
  if (info.id) {
    let url = `${urls.superadmin_margin}${info.id}/`;
    return axios.$put(url, {update_info: info})
      .then(handleResponse)
      .then(response => {
        return response;
      });
  }
}

function deleteMargin_superadmin(margin_id) {
  if (margin_id) {
    let url = `${urls.superadmin_margin}${margin_id}/`;
    return axios.$delete(url)
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
