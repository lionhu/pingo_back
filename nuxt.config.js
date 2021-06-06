import TerserPlugin from 'terser-webpack-plugin'
const environment = process.env.NODE_ENV
const envSettings = require(`./env.pingo.js`)
// const envSettings = require(`./env.${environment}.js`)

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  dev: false,
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  env:envSettings,
  router: {
    base: '/backend/'
    // base: '/'
  },
  target: "static",

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'PINGO backend',
    htmlAttrs: {
      lang: 'en'
    },
    base: {
      href: 'router.base'
    },
    meta: [
      {charset: 'utf-8'},
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: ''
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/backend/favicon.ico'
      }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/scss/app.scss',
    // './node_modules/element-ui/packages/theme-chalk/src/base.scss',
  ],


  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/localStorage.js',
    '~/plugins/filters.js',
    '~/plugins/vue_lazyload.js',
    '~/plugins/vue-click-outside.js',
    "~/plugins/vuelidate.js",
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    // '@nuxt/typescript-build',
  ],
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    'nuxt-i18n',
    'bootstrap-vue/nuxt',
    'nuxt-fontawesome',
    '@nuxt/image',
  ],

  fontawesome: {
    component: 'fa',
    imports: [{
      set: '@fortawesome/free-solid-svg-icons',
      icons: ['faAdjust', 'faHeart', "faUser"]
    }
    ]
  },

  bootstrapVue: {
    components: ['BContainer', 'BRow', 'BCol', 'BFormGroup', 'BFormInput', 'BFormRadioGroup', 'BFormRadio',
      'BFormCheckbox', 'BFormSelect', 'BButton', 'BAlert', 'BBadge', 'BTabs', 'BTab', 'BModal', 'BNavItemDropdown',
      'BDropdown', 'BSpinner', 'BDropdownItem', 'BBreadcrumb', 'BDropdownHeader', 'BDropdownDivider'],
    directives: ['VBModal', 'VBPopover', 'VBTooltip', 'VBScrollspy'],
    componentPlugins: [
      'ModalPlugin']
  },
  i18n: {
    locales: ['en', 'jp', 'zh'],
    defaultLocale: 'jp',
    vueI18n: {
      fallbackLocale: 'jp',
      messages: {
        en: require('./locales/en.json'),
        jp: require('./locales/jp.json'),
        zh: require('./locales/zh.json')
      }
    }
  },

  axios: {
    baseURL: process.env.DJANGO_SERVER,
    browserBaseURL: process.env.DJANGO_SERVER,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // analyze: true,
    extractCSS: true,
    babel: {
      compact: true
    },
    transpile: [
      "vee-validate/dist/rules",
      "/node_modules\/(dom7|swiper)\/.*/]",
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: false
        })
      ]
    }
  },

  watchers: {
    chokidar: {
      usePolling: true,
      useFsEvents: false
    },
    webpack: {
      aggregateTimeout: 300,
      poll: true
    }
  }
}
