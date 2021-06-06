export default function ({store, route, redirect}) {
  let user = JSON.parse(localStorage.getItem('user'));
  console.log("middleware vendor route")
  return user && user.role==="vendor" ? redirect() : redirectToLogin()

  function redirectToLogin() {
    // Pass the original route to the login component
    localStorage.removeItem('user');
    redirect('/account/login')
  }
}
