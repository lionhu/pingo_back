export let axios;

export default function ({$axios, store, redirect}, inject) {
  $axios.onRequest(request => {

    $axios.defaults.headers.common['Accept'] = 'application/json';
    $axios.defaults.xsrfCookieName = "csrftoken";
    $axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    let user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      $axios.defaults.headers.common['Authorization'] = user.token;
    }
    // console.log($axios.defaults.headers.common['Authorization'])

    console.log(request)
    return request;
  })
  $axios.onResponse(response => {
    console.log('[ RESPONSE ]' + response.request.responseURL, response)
    // TODO: If token expires, perform a silent refresh
    return response
  });

  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    if (code === 401 || isNaN(code)) {
      console.log("axios error 401");
      console.log(localStorage.getItem('user'))
      // window.location.href = "/backend/account/login"
    }
    return error
  });

  axios = $axios;
  inject("axios", axios)
}
