<script>
import {mapState} from 'vuex'

export default {
  name: "backend_SuperAdmin_index",
  components: {
    PageHeader: () => import(/* webpackChunkName: "about" */ '~/components/Page-header')
  },
  middleware: ['router-auth','router-superadmin'],
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
  computed: {
    ...mapState({
      ME: state => state.auth.user
    }),
    page_title() {
      return "Welcome ! Clients Admin " + this.ME.username;
    },
    point_balance() {
      if (this.ME.profile.point_balance=== null || this.ME.profile.point_balance === undefined) return 0;
      return this.ME.profile.point_balance
    },
    validpoint_balance() {
      if (this.ME.profile.validpoint_balance=== null || this.ME.profile.validpoint_balance === undefined) return 0;
      return this.ME.profile.validpoint_balance
    },
    invalidpoint_balance() {
      if (this.ME.profile.invalidpoint_balance=== null || this.ME.profile.invalidpoint_balance === undefined) return 0;
      return this.ME.profile.invalidpoint_balance
    }
  },
}
</script>

<template>
  <div>
    <PageHeader :title="page_title" :items="items"/>
    <div class="row">
      <div class="col-xl-3 col-lg-4">
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
                    </span> <span class="text-nowrap">Since last month</span></p></div>
              <div class="avatar-sm">
                <span class="avatar-title bg-soft-primary rounded">
                <i class="fe-users font-20 text-primary"></i></span>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 title="Campaign Sent" class="text-muted font-weight-normal mt-0 text-truncate">Valid  Points</h5>
                <h3 class="my-2 py-1">
                  <span data-plugin="counterup">{{ validpoint_balance | currency("¥") }}</span></h3>
                <p class="mb-0 text-muted"><span class="text-success mr-2">
                  <span class="mdi mdi-arrow-up-bold"></span>
                       {{ invalidpoint_balance | currency("¥") }}
                    </span> <span class="text-nowrap">Waiting for approval</span></p></div>
              <div class="avatar-sm">
                <span class="avatar-title bg-soft-primary rounded">
                <i class="fe-dollar-sign font-20 text-primary"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-9 col-lg-8"></div>
    </div>

  </div>
</template>
