import {userService} from '../helpers/fakebackend/user.service';
import Swal from 'sweetalert2'

const user = JSON.parse(localStorage.getItem('user'));

export const state = () => ({
  list: []
})
export const actions = {
  // Logs in the user.
  // eslint-disable-next-line no-unused-vars
  load_superadmin_users({dispatch, commit}, url) {
    // commit("setUserList", [])

    return new Promise((resolve, reject) => {
      userService.getAll(url).then(res => {
        if (res.result) {
          resolve(res.data.users.results)
        }
      })
    })
  },
  set_User_Role({commit}, {user_id, role}) {
    return new Promise((resolve, reject) => {
      userService.setUserRole({user_id, role}).then(res => {
        resolve(res.id)
      })
    })
  }
};

export const mutations = {
  setUserList(state, res) {
    console.log(res)
    if (res.results) {
      res.results.forEach(function (user) {
        if (user.roles) {
          user.role = user.roles[0]
        } else {
          user.role = ""
        }
        return user;
      })
    }


    state.list = res;
  },
  setUserRole(state, res) {
    const index = state.list.results.findIndex(user => user.id === res.id);
    if (index > -1) {
      if (res.roles) {
        res.role = res.roles[0]
      } else {
        res.role = ""
      }
      state.list.results.splice(index, 1, res);
    }
  }
};

