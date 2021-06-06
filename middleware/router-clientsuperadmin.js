export default function ({store, route, redirect}) {
  let user = JSON.parse(localStorage.getItem('user'));

  return user && user.role==="client_superadmin" ? redirect() : redirectToLogin()

  function redirectToLogin() {
    // Pass the original route to the login component
    localStorage.removeItem('user');
    redirect('/account/login')
  }
}
