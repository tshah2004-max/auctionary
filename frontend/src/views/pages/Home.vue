<template>
  <div class="page">
    <div class="hero">
      <div class="hero-text">
        <h1>Find your next car</h1>
        <p>Bid on quality vehicles from verified sellers</p>
      </div>
      <span class="hero-badge">Live Auctions</span>
    </div>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="Search by make, model, or keyword..." @keyup.enter="fetchItems" />
      <button @click="fetchItems">Search</button>
    </div>

    <div v-if="loading" class="loading">Loading auctions...</div>
    <div v-if="!loading && items.length === 0" class="empty">No auctions found.</div>

    <div class="grid" v-if="!loading && items.length > 0">
      <router-link
        class="card"
        v-for="item in items"
        :key="item.item_id"
        :to="'/item/' + item.item_id"
      >
        <div class="card-status" :class="isEnded(item.end_date) ? 'status-ended' : 'status-active'">
          {{ isEnded(item.end_date) ? 'Ended' : 'Active' }}
        </div>
        <div class="card-title">{{ item.name }}</div>
        <div class="card-desc">{{ item.description }}</div>
        <div class="card-footer">
          <div class="card-bid">£{{ item.starting_bid }}</div>
          <div class="card-end">Ends {{ formatDate(item.end_date) }}</div>
        </div>
      </router-link>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="offset === 0">← Prev</button>
      <span>Page {{ currentPage }}</span>
      <button @click="nextPage" :disabled="items.length < limit">Next →</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      loading: true,
      error: "",
      searchQuery: "",
      limit: 10,
      offset: 0
    }
  },
  computed: {
    currentPage() {
      return Math.floor(this.offset / this.limit) + 1;
    }
  },
  mounted() {
    this.fetchItems();
  },
  methods: {
    fetchItems() {
      this.loading = true;
      let url = `http://localhost:3333/search?limit=${this.limit}&offset=${this.offset}`;
      if (this.searchQuery.trim()) url += `&q=${encodeURIComponent(this.searchQuery.trim())}`;

      fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
      .then(response => response.json())
      .then(data => {
        this.items = data;
        this.loading = false;
      })
      .catch(err => {
        console.log("Error:", err);
        this.loading = false;
      });
    },
    prevPage() {
      if (this.offset >= this.limit) {
        this.offset -= this.limit;
        this.fetchItems();
      }
    },
    nextPage() {
      if (this.items.length === this.limit) {
        this.offset += this.limit;
        this.fetchItems();
      }
    },
    isEnded(end_date) {
      return Date.now() > end_date;
    },
    formatDate(end_date) {
      return new Date(end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
}
</script>

<style scoped>
.page {
  font-family: 'Segoe UI', sans-serif;
}

.hero {
  background: #1a1a2e;
  border-radius: 10px;
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-text h1 {
  font-size: 1.8rem;
  color: white;
  margin-bottom: 6px;
}

.hero-text p {
  color: #aaa;
  font-size: 0.95rem;
}

.hero-badge {
  background: #e63946;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.search-bar input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.search-bar input:focus {
  outline: none;
  border-color: #e63946;
}

.search-bar button {
  padding: 10px 20px;
  background: #e63946;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.search-bar button:hover {
  background: #c0392b;
}

.loading, .empty {
  color: #888;
  margin: 20px 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.card:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  border-color: #e63946;
}

.card-status {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 10px;
}

.status-active { background: #e0f7e9; color: #27ae60; }
.status-ended { background: #f0f0f0; color: #999; }

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 6px;
  line-height: 1.3;
}

.card-desc {
  font-size: 0.82rem;
  color: #666;
  margin-bottom: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.card-bid {
  font-size: 1rem;
  font-weight: 700;
  color: #e63946;
}

.card-end {
  font-size: 0.75rem;
  color: #999;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  margin-top: 10px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.pagination button:hover:not(:disabled) {
  border-color: #e63946;
  color: #e63946;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

.pagination span {
  font-size: 0.9rem;
  color: #666;
}
</style>