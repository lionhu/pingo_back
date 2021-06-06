<script>
import {
  required,
  email
} from "vuelidate/lib/validators";

/**
 * Login component
 */
export default {
  name: "auth_login",
  data() {
    return {
      email: "huhaiguang@me.com",
      password: "lionhu",
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
    };
  },
  computed: {
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  created() {
  },
  validations: {
    email: {
      required,
      email
    },
    password: {
      required
    },
  },
  methods: {
    // Try to log the user in with the username
    // and password they provided.
    tryToLogIn() {
      this.submitted = true;
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        const {
          email,
          password
        } = this;
        if (email && password) {
          this.$store.dispatch('auth/login', {
            email,
            password
          }).then((user) => {
            if (user.role !== undefined && user.role !== "") {
              this.$router.push(
                this.$route.query.redirectFrom || {
                  path: `/${user.role}/`
                }
              );
            }
          });
          this.$store.dispatch('notification/clear')
        }
      }
    },
  },
  layout: 'auth'
}
</script>

<template>
  <div>
    <!-- Logo -->
    <div class="auth-brand text-center text-lg-left">
      <div class="auth-logo">
        <nuxt-link to="/" class="logo logo-dark text-center">
                <span class="logo-lg">
                    <img src="~/assets/images/logo-dark.png" alt height="22"/>
                </span>
        </nuxt-link>

        <nuxt-link to="/" class="logo logo-light text-center">
                <span class="logo-lg">
                    <img src="~/assets/images/logo-light.png" alt height="22"/>
                </span>
        </nuxt-link>
      </div>
    </div>
    <!-- title-->
    <h4 class="mt-0">Sign In</h4>
    <p class="text-muted mb-4">Enter your email address and password to access admin panel.</p>
    <!-- form -->
    <form>
      <b-alert :variant="notification.type" class="mt-3" v-if="notification.message"
               :show="notificationAutoCloseDuration" dismissible>{{ notification.message }}
      </b-alert>

      <b-alert variant="danger" class="mt-3" v-model="isAuthError" :show="notificationAutoCloseDuration"
               dismissible>{{ authError }}
      </b-alert>
      <div class="form-group mb-3">
        <label for="emailaddress">Email</label>
        <input class="form-control" v-model="email" type="email" id="emailaddress"
               placeholder="Enter your email" :class="{ 'is-invalid': submitted && $v.email.$error }">
        <div v-if="submitted && $v.email.$error" class="invalid-feedback">
          <span v-if="!$v.email.required">Email is required.</span>
          <span v-if="!$v.email.email">Please enter valid email.</span>
        </div>
      </div>


      <div class="form-group mb-3">
        <label for="password">Password</label>
        <div class="input-group input-group-merge">
          <input v-model="password" type="password" id="password" class="form-control"
                 placeholder="Enter your password" :class="{ 'is-invalid': submitted && $v.password.$error }">

          <div class="input-group-append" data-password="false">
            <div class="input-group-text">
              <span class="password-eye"></span>
            </div>
          </div>
          <div v-if="submitted && !$v.password.required" class="invalid-feedback">Password is required.</div>
        </div>
      </div>

      <div class="form-group mb-3">
        <div class="custom-control custom-checkbox">
          <input type="checkbox" class="custom-control-input" id="checkbox-signin" checked>
          <label class="custom-control-label" for="checkbox-signin">Remember me</label>
        </div>
      </div>

      <div class="form-group mb-0 text-center">
        <a href="javascript:void(0);" class="btn btn-primary btn-block" @click="tryToLogIn"> Log In </a>
      </div>

    </form>

    <footer class="footer footer-alt">
      <p class="text-muted">
        Don't have an account?
        <nuxt-link to="/account/register" class="text-primary ml-1">
          <b>Sign Up</b>
        </nuxt-link>
      </p>
    </footer>

  </div>

  <!-- end row -->
</template>
