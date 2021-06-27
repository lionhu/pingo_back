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
    UnapprovedPoints: () => import("./widgets/UnapprovedPoint"),
    UnapprovedUserPoint: () => import("./widgets/UnapprovedUserPoint"),
    ViewProductRanking: () => import("./widgets/ViewProductRanking")
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
    }
  },
  async asyncData() {
    const response_data=await axios.post("/admin_back/api/admin_dashboard/get_charts/")
      .then(response => {
        if (response.data.result) {
          return response.data.charts;
        }
      })
    return {
      unApprovedPoints: {
        labels: response_data.margin_summary.labels,
        data: response_data.margin_summary.datasets[0].data
      },
      unApprovedUserPoints: {
        labels: response_data.user_margin_summary.labels,
        data: response_data.user_margin_summary.datasets
      },
      user_ranking: {
        labels: response_data.user_ranking.labels,
        data: response_data.user_ranking.datasets[0].data
      }
      // viewproduct_summary: {
      //   labels:response_data.viewproduct_summary.labels,
      //   data: response_data.viewproduct_summary.datasets[0].data
      // }
    }
  },
  mounted() {
  },
  methods: {
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
    <div class="row">
      <div class="col-md-6 col-xs-12">
        <UnapprovedPoints :unapprovedpoints_data="unApprovedPoints" header_title="未承認ポイント　サマリー" title="カテゴリ別"/>
      </div>
      <div class="col-md-6 col-xs-12">
        <UnapprovedUserPoint :unapprovedpoints_data="unApprovedUserPoints" header_title="未承認ポイント　サマリー" title="ユーザー別(Top3)"/>
      </div>
    </div>
    <PointUserRanking :user_ranking="user_ranking" header_title="持ちポイントランキング" title="ユーザー別(Top3)"></PointUserRanking>
    <div class="row">
      <div class="col-6">
<!--        <VisitLogSummary/>-->
      </div>
      <div class="col-6">
<!--        <RegisteredUsers/>-->
      </div>
    </div>

  </div>
</template>
