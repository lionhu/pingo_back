<script>
import {mapState} from 'vuex'
import {axios} from "@/plugins/axios"
export default {
  name: "backend_SuperAdmin_index",
  components: {
    PageHeader: () => import(/* webpackChunkName: "about" */ '~/components/Page-header'),
    DescendantSummary: () => import("@/components/widgets/DescendantSummary"),
    PointSummary: () => import("@/components/widgets/PointSummary"),
    VisitLogSummary: () => import("@/components/widgets/VisitLogSummary"),
    UsersSummary: () => import("@/components/widgets/UsersSummary"),
    PointUserRanking: () => import("./widgets/PointUserRanking"),
  },
  middleware: ['router-auth', 'router-superadmin'],
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
  head() {
    return {
      title: 'Client Admin Dashboard | PINGO Backend'
    }
  },
  mounted() {
    axios.get("/admin_back/api/pointbanks/").then(response =>{
      console.log(response)
    })
    axios.post("/admin_back/api/pointbanks/user_ranking/").then(response =>{
      let response_data= response.data
      let summary=JSON.parse(response_data.data.summary)
      console.log("summary",summary)
    })
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

    <PointUserRanking></PointUserRanking>
    <div class="row">
      <div class="col-xl-12 col-lg-4">
<!--        <PointSummary/>-->
        <DescendantSummary/>
      </div>
      <div class="col-xl-12 col-lg-8">
        <VisitLogSummary/>
      </div>

    </div>

    <UsersSummary/>

  </div>
</template>
