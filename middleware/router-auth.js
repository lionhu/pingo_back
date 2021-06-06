import {axios} from "@/plugins/axios";

export default function ({store, route, redirect}) {
  const publicPages = ['/backend/account/login', '/backend/account/register', '/backend/account/forgot-password'];
  const authpage = !publicPages.includes(route.path);
  const loggeduser = localStorage.getItem('user');

  if (authpage && !loggeduser) {
    return redirectToLogin()
  }
  axios.$post(`/apiauth/profile/validate_token/`)
    .then(response => {
      return response ? redirect() : redirectToLogin()
    })

  function redirectToLogin() {
    localStorage.removeItem('user');
    redirect('/account/login')
  }
}
