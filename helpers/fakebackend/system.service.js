import {axios} from '@/plugins/axios.js';
import {swalService} from "~/helpers/fakebackend/swal.service";

export const systemService = {
  system_info,
};
const urls = {
  "list": "/back/store/api/backend_system_info/",
}

function system_info() {
  return axios.$get(urls.list)
    .then(handleResponse)
    .then(response => {
      return response;
    });
}


function handleResponse(response) {
    const loggeduser = localStorage.getItem('user');
  // alert("stop system")
  if (response === undefined || response.status === 401) {
    if (!loggeduser) {
      window.location.href = "/backend/account/login"
    }
    else {
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
