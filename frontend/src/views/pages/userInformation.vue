<template>
  <div class="page">
    <div v-if="loading" class="loading">Loading profile...</div>

    <div v-if="!loading && user">
      <div class="profile-header">
        <div class="avatar">{{ initials }}</div>
        <div>
          <h1>{{ user.first_name }} {{ user.last_name }}</h1>
          <p class="email">{{ user.email }}</p>
        </div>
      </div>

      <div class="section">
        <h2>🚗 Listings ({{ user.items ? user.items.length : 0 }})</h2>
        <div v-if="!user.items || user.items.length === 0" class="empty">No listings yet.</div>
        <div class="card-grid" v-else>
          <router-link
            class="card"
            v-for="item in user.items"
            :key="item.item_id"
            :to="'/item/' + item.item_id"
          >
            <div class="card-name">{{ item.name }}</div>
            <div class="card-meta">Starting bid: £{{ item.starting_bid }}</div>
            <div class="card-status" :class="statusClass(item.end_date)">
              {{ statusLabel(item.end_date) }}
            </div>
          </router-link>
        </div>
      </div>

      <div class="section">
        <h2>🏷️ Bids Placed ({{ user.bids ? user.bids.length : 0 }})</h2>
        <div v-if="!user.bids || user.bids.length === 0" class="empty">No bids placed yet.</div>
        <div class="card-grid" v-else>
          <router-link
            class="card"
            v-for="bid in user.bids"
            :key="bid.item_id + '-' + bid.amount"
            :to="'/item/' + bid.item_id"
          >
            <div class="card-name">{{ bid.name }}</div>
            <div class="card-meta">Your bid: £{{ bid.amount }}</div>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="!loading && !user" class="error-banner">User not found.</div>
  </div>
</template>

<script>
export default {
  props: ['user_id'],
  data() {
    return {
      user: null,
      loading: true
    }
  },
  computed: {
    initials() {
      if (!this.user) return '?';
      return (this.user.first_name[0] + this.user.last_name[0]).toUpperCase();
    }
  },
  mounted() {
    const id = this.user_id || this.$route.params.user_id;
    fetch(`http://localhost:3333/user/${id}`)
      .then(r => {
        if (r.status === 404) throw "Not found";
        return r.json();
      })
      .then(data => {
        this.user = data;
        this.loading = false;
      })
      .catch(() => {
        this.user = null;
        this.loading = false;
      });
  },
  methods: {
    statusLabel(end_date) {
      return Date.now() > end_date ? 'Ended' : 'Active';
    },
    statusClass(end_date) {
      return Date.now() > end_date ? 'status-ended' : 'status-active';
    }
  }
}
</script>

<style scoped>
.page {
  max-width: 750px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Segoe UI', sans-serif;
}

.loading { color: #888; }

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 36px;
}

.avatar {
  background: #e63946;
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

h1 { margin: 0; color: #1a1a2e; font-size: 1.6rem; }
.email { margin: 4px 0 0; color: #777; font-size: 0.9rem; }

.section { margin-bottom: 36px; }
.section h2 { color: #1a1a2e; font-size: 1.2rem; margin-bottom: 14px; border-bottom: 2px solid #e63946; padding-bottom: 6px; }

.empty { color: #aaa; font-style: italic; }

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 14px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
  display: block;
}

.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

.card-name { font-weight: 600; color: #1a1a2e; margin-bottom: 6px; font-size: 0.95rem; }
.card-meta { color: #555; font-size: 0.85rem; margin-bottom: 8px; }

.card-status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-active { background: #e0f7e9; color: #27ae60; }
.status-ended { background: #f0f0f0; color: #999; }

.error-banner { background: #ffe0e0; color: #c0392b; padding: 10px 14px; border-radius: 6px; }
</style>