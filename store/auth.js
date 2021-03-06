import {userService} from '../helpers/fakebackend/user.service';

const user = JSON.parse(localStorage.getItem('user'));

export const state = () => {
  return user
    ? {status: {loggeduser: true}, user}
    : {status: {}, user: null};
}
export const actions = {
  // Logs in the user.
  // eslint-disable-next-line no-unused-vars
  login({dispatch, commit}, {email, password,role}) {
    commit('loginRequest', {email});
    return new Promise(resolve => {
      userService.login(email, password,role)
        .then(
          user => {
            commit('loginSuccess', user);
            resolve(user);
          },
          error => {
            commit('loginFailure', error);
            dispatch('notification/error', error, {root: true});
          }
        );
    }, reject => {

    })
  },
  // Logout the user
  logout({commit}) {
    userService.logout();
    commit('logout');
    // window.location.href="/account/logout";
  },
  // register the user
  registeruser({dispatch, commit}, user) {
    commit('registerRequest', user);
    userService.register(user)
      .then(
        user => {
          commit('registerSuccess', user);
          dispatch('notification/success', 'Registration successful', {root: true});
          this.$router.push({path: "/account/login"});
        },
        error => {
          commit('registerFailure', error);
          dispatch('notification/error', error, {root: true});
        }
      );
  },
  validate({commit, state}) {
    if (!state.user) return Promise.resolve(null)
    if(!state.user){
        commit('logout');
    }
    return userService.validateToken().then(response => {
      return response;
    });

  },
};

export const mutations = {
  update_user_profile(state,profile){
    state.user.profile=profile;
    console.log("updated profile",state.user.profile)
  },
  loginRequest(state, user) {
    state.status = {loggingIn: true};
    state.user = user;
  },
  loginSuccess(state, user) {
    state.status = {loggeduser: true};
    state.user = user;
  },
  loginFailure(state) {
    state.status = {};
    state.user = null;
  },
  logout(state) {
    state.status = {};
    state.user = null;
    // window.location.href = "/account/login"
  },
  registerRequest(state) {
    state.status = {registering: true};
  },
  registerSuccess(state) {
    state.status = {};
  },
  registerFailure(state) {
    state.status = {};
  }
};

