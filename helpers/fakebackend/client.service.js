import {axios} from '@/plugins/axios.js';
import {swalService} from "~/helpers/fakebackend/swal.service";

export const clientService = {
  load_superadmin_clients,
  register_clients,
  update_client,
  remove_client
};

function load_superadmin_clients() {
  return axios.$post(`/apiauth/client/show_for_superadmin/`)
    .then(handleResponse)
    .then(res => {
      console.log(res)
      return res;
    }).catch(error => {
      console.log(error)

    });
}

function register_clients(payload) {
  return axios.$post(`/apiauth/client/`, payload)
    .then(handleResponse)
    .then(res => {
      return res;
    }).catch(error => {
      console.log(error)
    });
}
function update_client(payload) {
  return axios.$put(`/apiauth/client/${payload.id}/`, payload)
    .then(handleResponse)
    .then(res => {
      return res;
    }).catch(error => {
      console.log(error)
    });
}

function remove_client(payload) {
  return axios.$delete(`/apiauth/client/${payload}/`)
    .then(handleResponse)
    .then(res => {
      return res;
    }).catch(error => {
      console.log(error)
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
    swalService.showModal('Error', response.message,'error')
    return Promise.reject(error);
  }
  return response.data;
}
