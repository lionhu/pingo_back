<script>
import {mapState} from 'vuex'
import {axios} from "@/plugins/axios"



export default {
  name: "backend_SuperAdmin_index",
  components: {
    PageHeader: () => import(/* webpackChunkName: "about" */ '~/components/Page-header'),
    DescendantSummary: () => import("@/components/widgets/DescendantSummary"),
    PointSummary: () => import("@/components/widgets/PointSummary"),
    VisitLogSummary: () => import("./widgets/VisitLogSummary"),
    RegisteredUsers: () => import("./widgets/RegisteredUsers"),
    PointUserRanking: () => import("./widgets/PointUserRanking"),
    UnapprovedPoints:()=>import("./widgets/UnapprovedPoint"),
    ViewProductRanking:()=>import("./widgets/ViewProductRanking")
  },
  middleware: ['router-auth', 'router-superadmin'],

  head() {
    return {
      title: 'Client Admin Dashboard | PINGO Backend',
      script: [
        {src: 'https://unpkg.com/element-ui/lib/index.js'}
      ],
      link: [
        {rel: 'stylesheet', href: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'}
      ]
    };
  },
  data() {
    return {
      items: [
        {
          text: 'PINGO'
        },
        {
          text: 'Dashboards'
        },
        {
          text: 'Sales',
          active: true
        }
      ],
      unApprovedPoints:{
        labels:[],
        data:[]
      },
      user_ranking:{},
      viewproduct_summary:{
        labels:[],
        data:[]
      }
    }
  },
  mounted() {
    let vm=this;
    axios.get("/admin_back/api/pointbanks/").then(response => {
      console.log(response)
    })
    axios.post("/admin_back/api/admin_dashboard/get_charts/")
      .then(response => {
        if (response.data.result) {
          vm.unApprovedPoints.labels=response.data.charts.margin_summary.labels;
          vm.unApprovedPoints.data=response.data.charts.margin_summary.datasets[0].data;
          vm.user_ranking = JSON.parse(response.data.charts.user_ranking)
          vm.viewproduct_summary.labels=response.data.charts.viewproduct_summary.labels;
          vm.viewproduct_summary.data=response.data.charts.viewproduct_summary.datasets[0].data;
        }
      })
  },
  methods:{
    create_viewproduct_ranking(){
    }
  },
  computed: {
    ...mapState({
      ME: state => state.auth.user
    }),
    page_title() {
      return "Welcome ! Clients Admin " + this.ME.username;
    },
    point_balance() {
      if (this.ME.profile.point_balance === null || this.ME.profile.point_balance === undefined) return 0;
      return this.ME.profile.point_balance
    },
    validpoint_balance() {
      if (this.ME.profile.validpoint_balance === null || this.ME.profile.validpoint_balance === undefined) return 0;
      return this.ME.profile.validpoint_balance
    },
    invalidpoint_balance() {
      if (this.ME.profile.invalidpoint_balance === null || this.ME.profile.invalidpoint_balance === undefined) return 0;
      return this.ME.profile.invalidpoint_balance
    }
  },
}
</script>

<template>
  <div>
    <PageHeader :title="page_title" :items="items"/>

<!--    <ViewProductRanking :viewproduct_summary="viewproduct_summary"-->
<!--                        header_title="閲覧商品ランキング"-->
<!--                      title="商品別"/>-->
    <UnapprovedPoints :unapprovedpoints_data="unApprovedPoints"
                      header_title="未承認ポイント　サマリー"
                      title="カテゴリ別"/>
    <PointUserRanking :user_ranking="user_ranking"></PointUserRanking>
    <div class="row">
      <div class="col-6">
    <VisitLogSummary/>
      </div>
      <div class="col-6">
    <RegisteredUsers/>
      </div>
    </div>

  </div>
</template>
