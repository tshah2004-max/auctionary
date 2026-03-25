<template>
  <div>
    <nav class="navbar">
      <div class="nav-brand">🚗 AutoBid</div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <template v-if="!isLoggedIn">
          <router-link to="/login">Login</router-link>
          <router-link to="/users">Create Account</router-link>
        </template>
        <template v-else>
          <router-link to="/create">List a Car</router-link>
          <router-link :to="'/users/' + userId">My Profile</router-link>
          <button class="logout-btn" @click="handleLogout">Logout</button>
        </template>
      </div>
    </nav>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      userId: null
    };
  },
  mounted() {
    this.checkAuth();
  },
  watch: {
    $route() {
      this.checkAuth();
    }
  },
  methods: {
    checkAuth() {
      this.isLoggedIn = !!localStorage.getItem("session_token");
      this.userId = localStorage.getItem("user_id");
    },
    handleLogout() {
      const token = localStorage.getItem("session_token");
      fetch("http://localhost:3333/logout", {
        method: "DELETE",
        headers: { "X-Authorization": token }
      })
      .finally(() => {
        localStorage.removeItem("session_token");
        localStorage.removeItem("user_id");
        this.isLoggedIn = false;
        this.userId = null;
        this.$router.push("/login");
      });
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #f4f4f4;
  color: #222;
}

.navbar {
  background: #1a1a2e;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  color: #e63946;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-links a {
  color: #ccc;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #e63946;
}

.logout-btn {
  background: #e63946;
  color: white;
  border: none;
  padding: 7px 16px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c0392b;
}

.content {
  padding: 30px 32px;
  max-width: 1100px;
  margin: 0 auto;
}
</style>