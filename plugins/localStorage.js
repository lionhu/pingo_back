import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  createPersistedState({
    key: 'vuex',
    paths: ['auth', 'layout',"system","categories","orders"]
  })(store)
}
