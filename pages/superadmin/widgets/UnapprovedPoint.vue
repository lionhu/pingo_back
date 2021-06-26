<script>
import VueApexCharts from "vue-apexcharts";
export default {
  name: "SuperAdmin_unapprovedpoints_summary",
  components: {
    apexchart: () => import("vue-apexcharts"),
  },
  props: ["unapprovedpoints_data", "header_title", "title"],
  data() {
    return {}
  },
  watch: {
    unapprovedpoints_data(newVal, oldVal) {
      console.log("newVal, oldVal", newVal, oldVal)
      if (newVal !== undefined) {
        this.refresh_chart();
      }
    }
  },
  mounted() {
    this.refresh_chart();
  },
  methods: {
    refresh_chart() {
      if (this.unapprovedpoints_data.data !== undefined){
        const chart_data = this.unapprovedpoints_data.data;
        const chart_labels = this.unapprovedpoints_data.labels;
        var options = {
          series: chart_data,
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
              return val + " - " + opts.w.globals.series[opts.seriesIndex]
            }
          },
          title: {
            text: this.title
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

        var chart = new ApexCharts(document.querySelector("#unapprovedchart"), options);
        chart.render();
      }
    }
  },
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h5>{{ header_title }}</h5>
      <div id="unapprovedchart"></div>
    </div>
  </div>
</template>
