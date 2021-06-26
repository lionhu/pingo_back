<script>
import {mapState} from 'vuex'
import {axios} from "@/plugins/axios"

import VueApexCharts from "vue-apexcharts";

export default {
  name: "backend_SuperAdmin_index",
  components: {
    PageHeader: () => import(/* webpackChunkName: "about" */ '~/components/Page-header'),
    DescendantSummary: () => import("@/components/widgets/DescendantSummary"),
    PointSummary: () => import("@/components/widgets/PointSummary"),
    VisitLogSummary: () => import("./widgets/VisitLogSummary"),
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
    axios.get("/admin_back/api/pointbanks/").then(response => {
      console.log(response)
    })
    axios.post("/admin_back/api/admin_dashboard/get_charts/").then(response => {
      const chart_data = response.data.data.datasets[0]
      const chart_labels = response.data.data.labels;
      console.log("/admin_back/api/admin_dashboard/get_charts/", chart_data)

      var options = {
        series: chart_data.data,
        chart: {
          height: 380,
          type: 'donut',
        },
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 270
          }
        },
        labels: chart_labels,
        // dataLabels: {
        //   enabled: true,
        //   labels: chart_data.labels,
        // },
        fill: {
          type: 'gradient',
        },
        legend: {
          formatter: function (val, opts) {
            console.log("val, opts", val, opts)
            return val + " - " + opts.w.globals.series[opts.seriesIndex]
          }
        },
        title: {
          text: 'Gradient Donut with custom Start-angle'
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      };

      var chart = new ApexCharts(document.querySelector("#chart"), options);
      chart.render();

    })
    axios.post("/admin_back/api/pointbanks/user_ranking/").then(response => {
      let response_data = response.data
      let summary = JSON.parse(response_data.data.summary)
      console.log("summary", summary)
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

    <div id="chart"></div>
    <PointUserRanking></PointUserRanking>
    <VisitLogSummary/>
    <UsersSummary/>

  </div>
</template>
