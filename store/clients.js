import {clientService} from '../helpers/fakebackend/client.service';

const user = JSON.parse(localStorage.getItem('user'));

export const state = () => ({
  list: []
})
export const actions = {
  load_superadmin_clients({dispatch, commit}) {
    clientService.load_superadmin_clients().then(res => {
      commit("setClientList", res.clients)
    })
  },
  register_client({dispatch, commit}, client) {
    return new Promise(resolve => {
      clientService.register_clients(client)
        .then(response => {
          resolve(response)
        });
    })
  },
  update_client({dispatch, commit}, client) {
    return new Promise(resolve => {
      clientService.update_client(client)
        .then(response => {
          resolve(response)
        });
    })
  },
  remove_client({dispatch, commit}, client_id) {
    return new Promise(resolve => {
      clientService.remove_client(client_id)
        .then(response => {
              resolve(response)
          });
    })
  }
};

export const mutations = {
  setClientList(state, clients) {
    state.list = clients;
  },
  addClient(state, client) {
    state.list.splice(0, 0, client)
  },
  removeClient(state,client_id){
    var index=state.list.findIndex(function (client){
      console.log(client.id,client_id)
      return client.id===parseInt(client_id)
    })
    console.log(client_id,index)
    if(index>-1){
      state.list.splice(index,1)
    }
  }
};

