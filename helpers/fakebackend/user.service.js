import {axios} from '@/plugins/axios.js';
// import Swal from "sweetalert2";
import {swalService} from "~/helpers/fakebackend/swal.service";

export const userService = {
  login,
  logout,
  register,
  getAll,
  setUserRole,
  validateToken
};

function validateToken() {
  let user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    axios.defaults.headers.common['Authorization'] = user.token;
    return axios.$post(`/apiauth/profile/validate_token/`)
      .then(response => {
        return !!(response && response.result);
      })
  }
  return false;
}

function login(email, password) {
  return axios.$post(`/apiauth/login/back_login/`, {email, password})
    .then(handleResponse)
    .then(user => {
      console.log(user)
      if (user.token) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    }).catch(error => {
      console.log(error)
    });
}

function logout() {
  localStorage.removeItem('user');
}

function register(user) {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(user)
  };
  return fetch(`/users/register`, requestOptions).then(handleResponse);
}

function getAll(url) {
  console.log(url)
  return axios.$get(url)
    .then(response => {
      return response;
    });
}

function setUserRole({user_id, role}) {
  const url = `/apiauth/users/${user_id}/set_user_role/`
  console.log(url)
  console.log(role)
  return axios.$post(url, {user_id, role})
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
    swalService.showModal('Error', response.message, 'error')
    return Promise.reject(error);
  }
  return response.data;
}

