<script>
import {mapState} from 'vuex'
import ApexCharts from 'apexcharts'

export default {
  name: "backend_CA_index",
  components: {
    PageHeader: () => import(/* webpackChunkName: "about" */ '~/components/Page-header'),
    apexchart: ApexCharts
  },
  middleware: ['router-auth', 'router-clientadmin'],
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
      rankings: [],
      viewproduct_rankings: [],
      viewproduct_chart_data:{}
    }
  },
  head() {
    return {
      title: 'Client Admin Dashboard | PINGO Backend',
      // script: [
      //   {src: 'https://cdn.jsdelivr.net/npm/apexcharts'}
      // ],
      // link: [
      //   {rel: 'stylesheet', href: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'}
      // ]
    };
  },

  mounted() {
    let vm = this;
    let url = `/back/store/api/clientadmin/${this.ME.profile.user_id}/summary_info/`;
    console.log(url);
    this.$axios.post(url).then((response) => {
      console.log(response.data)
      console.log(JSON.parse(response.data.data.json_margin_top5))
      if (response.data.result) {
        vm.rankings = JSON.parse(response.data.data.json_margin_top5)
        vm.viewproduct_rankings = JSON.parse(response.data.data.json_viewproducts_top5)
        vm.$store.commit("auth/update_user_profile", response.data.data.profile);
        vm.draw_charts();
        vm.draw_ranking();
        vm.draw_viewproducts_chart();
      }
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
    validpoint_percentage() {
      return parseInt(this.validpoint_balance / this.point_balance * 100);
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
  methods: {
    getImgUrl(url){
      return "https://www.pingo.jp/mediafiles/"+url;
    },
    draw_charts() {
      var options = {
        chart: {
          height: 280,
          type: "radialBar",
        },

        series: [this.validpoint_percentage],
        colors: ["#20E647"],
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: "70%",
              background: "#293450"
            },
            track: {
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                blur: 4,
                opacity: 0.15
              }
            },
            dataLabels: {
              name: {
                offsetY: -10,
                color: "#fff",
                fontSize: "13px"
              },
              value: {
                color: "#fff",
                fontSize: "30px",
                show: true
              }
            }
          }
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            gradientToColors: ["#87D4F9"],
            stops: [0, 100]
          }
        },
        stroke: {
          lineCap: "round"
        },
        labels: ["Valid points"]
      };

      var chart = new ApexCharts(document.querySelector("#chart"), options);

      chart.render();
    },
    draw_viewproducts_chart() {
      console.log("this.viewproduct_rankings",this.viewproduct_rankings)
      var rankinglist = this.viewproduct_rankings.reduce((result, current) => {
        result.data.push(current.count);
        result.series_name.push(current.product_name);
        return result;
      }, {data: [], series_name: []})

      console.log("rankinglist", rankinglist);

      var options= {
          chart: {
            width: 380,
            type: 'donut',
          },
          series: rankinglist.data,
          labels:rankinglist.series_name,
          plotOptions: {
            pie: {
              startAngle: -90,
              endAngle: 270
            }
          },
          dataLabels: {
            enabled: false
          },
          fill: {
            type: 'gradient',
          },
          legend: {
            position:"bottom"
            // formatter: function (val, opts) {
            //   console.log("val",val);
            //   console.log("opts",opts);
            //   return val + " - " + opts.w.globals.series[opts.seriesIndex]
            // }
          },
          title: {
            text: 'Most Popular products',
          align: "center"
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
      var chart = new ApexCharts(document.querySelector("#viewproducts_ranking"), options);

      chart.render();
    },
    draw_ranking() {
      var rankinglist = this.rankings.reduce((result, current) => {
        result.data.push(current.sum);
        result.username.push(current.user_name);
        return result;
      }, {data: [], username: []})

      var chartOptions = {
        series: [
          {
            data: rankinglist.data
          }
        ],
        chart: {
          type: "bar",
          height: 230
        },
        plotOptions: {
          bar: {
            barHeight: "100%",
            distributed: true,
            horizontal: true,
            dataLabels: {
              position: "bottom"
            }
          }
        },
        colors: [
          "#90ee7e",
          "#f48024",
          "#69d2e7"
        ],
        dataLabels: {
          enabled: true,
          textAnchor: "start",
          style: {
            colors: ["#fff"]
          },
          formatter: function (val, opt) {
            return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
          },
          offsetX: 0,
          dropShadow: {
            enabled: true
          }
        },
        stroke: {
          width: 1,
          colors: ["#fff"]
        },
        xaxis: {
          categories: rankinglist.username
        },
        yaxis: {
          labels: {
            show: false
          }
        },
        title: {
          text: "Most contribute members",
          align: "center",
          floating: true
        },
        subtitle: {
          text: "Most powerful members supporting you",
          align: "center"
        },
        tooltip: {
          theme: "dark",
          x: {
            show: false
          },
          y: {
            title: {
              formatter: function () {
                return "";
              }
            }
          }
        }
      };
      var chart = new ApexCharts(document.querySelector("#ranking"), chartOptions);

      chart.render();
    }
  }
}
</script>

<template>
  <div>
    <PageHeader :title="page_title" :items="items"/>
    <div id="chart"></div>

    <div class="row">
      <div class="col-lg-4 col-xs-6">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 title="Campaign Sent" class="text-muted font-weight-normal mt-0 text-truncate">Followers</h5>
                <h3 class="my-2 py-1">
                  <span data-plugin="counterup">{{ ME.profile.get_descendants_count }}</span></h3>
                <p class="mb-0 text-muted"><span class="text-success mr-2">
                  <span class="mdi mdi-arrow-up-bold"></span>
                        3.27%
                    </span> <br> <span class="text-nowrap">Since last month</span></p></div>
              <div class="avatar-sm">
                <span class="avatar-title bg-soft-primary rounded">
                <i class="fe-users font-20 text-primary"></i></span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div class="col-lg-4 col-xs-6">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 title="Campaign Sent" class="text-muted font-weight-normal mt-0 text-truncate">Valid Points</h5>
                <h3 class="my-2 py-1">
                  <span data-plugin="counterup">{{ validpoint_balance | currency("¥") }}</span></h3>
                <p class="mb-0 text-muted"><span class="text-success mr-2">
                  <span class="mdi mdi-arrow-up-bold"></span>
                       {{ invalidpoint_balance | currency("¥") }}
                    </span> <br> <span class="text-nowrap">Waiting for approval</span>
                </p>
              </div>
              <div class="avatar-sm">
                <span class="avatar-title bg-soft-primary rounded">
                <i class="fe-dollar-sign font-20 text-primary"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-xl-4 col-lg-4">
        <div class="card">
          <div class="card-body">
            <div id="ranking"></div>
          </div>
        </div>
      </div>
      <div class="col-xl-8 col-lg-8">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <h5 class="text-muted font-weight-normal mt-0 text-truncate">Contributor Member Ranking</h5>
              <table class="table mb-0">
                <thead>
                <tr>
                  <th>#</th>
                  <th class="text-center">Name</th>
                  <th>Points</th>
                </tr>
                </thead>
                <tbody v-if="rankings.length">
                <tr v-for="(ranking,index) in rankings" :key="index">
                  <th scope="row">{{ index + 1 }}</th>
                  <td class="text-center">{{ ranking.user_name }}</td>
                  <td class="text-right">{{ ranking.sum|currency("¥") }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-xl-4 col-lg-4">
        <div class="card">
          <div class="card-body">
            <div id="viewproducts_ranking">
<!--              <apexchart type="donut" width="380" :options="viewproduct_chart_data.chartOptions" :series="viewproduct_chart_data.series"></apexchart>-->
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-8 col-lg-8">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <h5 class="text-muted font-weight-normal mt-0 text-truncate">Most popular products</h5>
              <table class="table mb-0">
                <thead>
                <tr>
                  <th>#</th>
                  <th class="text-center"></th>
                  <th class="text-center">Product</th>
                </tr>
                </thead>
                <tbody v-if="viewproduct_rankings.length">
                <tr v-for="(ranking,index) in viewproduct_rankings" :key="index">
                  <th scope="row">{{ index + 1 }}</th>
                  <td class="text-center">
                    <img :src="getImgUrl(ranking.url)" style="max-width:80px" alt="">
                  </td>
                  <td class="text-center">{{ ranking.product_name }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
