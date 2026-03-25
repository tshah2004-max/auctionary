<template>
  <div class="page">
    <div v-if="loading" class="loading">Loading auction...</div>

    <div v-if="!loading && item.item_id">
      <div class="item-header">
        <div>
          <div class="status-badge" :class="isEnded ? 'status-ended' : 'status-active'">
            {{ isEnded ? 'Auction Ended' : 'Live Auction' }}
          </div>
          <h1>{{ item.name }}</h1>
          <p class="seller">Listed by {{ item.first_name }} {{ item.last_name }}</p>
        </div>
        <div class="end-date">
          <span class="end-label">{{ isEnded ? 'Ended' : 'Ends' }}</span>
          <span class="end-value">{{ formatDate(item.end_date) }}</span>
        </div>
      </div>

      <div class="main-grid">
        <div class="left">
          <div class="card">
            <h2>Description</h2>
            <p class="description">{{ item.description }}</p>
          </div>
        </div>

        <div class="right">
          <div class="card bid-card">
            <div class="bid-row">
              <div class="bid-stat">
                <span class="bid-label">Starting bid</span>
                <span class="bid-value">£{{ item.starting_bid }}</span>
              </div>
              <div class="bid-stat">
                <span class="bid-label">Current bid</span>
                <span class="bid-value highlight">£{{ item.current_bid || item.starting_bid }}</span>
              </div>
            </div>

            <div v-if="item.current_bid_holder" class="bid-holder">
              <span class="bid-label">Highest bidder</span>
              <span class="bid-name">{{ item.current_bid_holder.first_name }} {{ item.current_bid_holder.last_name }}</span>
            </div>

            <div v-if="!isEnded" class="bid-form">
              <input
                type="number"
                v-model="bidAmount"
                :placeholder="'Enter more than £' + (item.current_bid || item.starting_bid)"
                min="1"
              />
              <button class="bid-btn" @click="handleBid">Place Bid</button>
            </div>

            <div v-if="error" class="error-banner">{{ error }}</div>
            <div v-if="bidSuccess" class="success-banner">{{ bidSuccess }}</div>
          </div>

          <div class="card actions-card">
            <router-link :to="'/item/' + item.item_id + '/questions'" class="action-link">
              ❓ View Questions & Answers
            </router-link>
            <router-link :to="'/users/' + item.creator_id" class="action-link">
              👤 View Seller Profile
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && !item.item_id" class="error-banner">Item not found.</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      item: {},
      loading: true,
      error: "",
      bidAmount: null,
      bidSuccess: "",
    }
  },
  computed: {
    isEnded() {
      return this.item.end_date && Date.now() > this.item.end_date;
    }
  },
  mounted() {
    this.fetchItem();
  },
  methods: {
    fetchItem() {
      fetch(`http://localhost:3333/item/${this.$route.params.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
      .then(response => {
        if (response.status === 200) return response.json();
        throw "Item not found";
      })
      .then(data => {
        this.item = data;
        this.loading = false;
      })
      .catch(err => {
        this.error = err;
        this.loading = false;
      });
    },
    handleBid() {
      this.error = "";
      this.bidSuccess = "";
      const token = localStorage.getItem("session_token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
      fetch(`http://localhost:3333/item/${this.$route.params.id}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": token
        },
        body: JSON.stringify({ amount: parseInt(this.bidAmount) })
      })
      .then(response => {
        if (response.status === 201) {
          this.bidSuccess = "Bid placed successfully!";
          this.bidAmount = null;
          this.fetchItem();
        } else if (response.status === 401) {
          throw "You must be logged in to place a bid.";
        } else if (response.status === 403) {
          throw "You cannot bid on your own listing.";
        } else {
          return response.json().then(err => { throw err.error_message || "Something went wrong."; });
        }
      })
      .catch(err => {
        this.error = typeof err === "string" ? err : "Something went wrong.";
      });
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
  max-width: 900px;
  margin: 0 auto;
}

.loading { color: #888; }

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 10px;
}

.status-active { background: #e0f7e9; color: #27ae60; }
.status-ended { background: #f0f0f0; color: #999; }

h1 {
  font-size: 1.7rem;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.seller { font-size: 0.88rem; color: #888; }

.end-date {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.end-label { font-size: 0.78rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
.end-value { font-size: 1rem; font-weight: 600; color: #1a1a2e; }

.main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 700px) {
  .main-grid { grid-template-columns: 1fr; }
}

.card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
}

.card h2 { font-size: 1rem; color: #1a1a2e; margin-bottom: 12px; }

.description { font-size: 0.92rem; color: #555; line-height: 1.7; }

.bid-card {}

.bid-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.bid-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bid-label { font-size: 0.75rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
.bid-value { font-size: 1.3rem; font-weight: 700; color: #1a1a2e; }
.bid-value.highlight { color: #e63946; }

.bid-holder {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bid-name { font-weight: 600; font-size: 0.9rem; color: #1a1a2e; }

.bid-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bid-form input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.bid-form input:focus { outline: none; border-color: #e63946; }

.bid-btn {
  background: #e63946;
  color: white;
  border: none;
  padding: 11px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.bid-btn:hover { background: #c0392b; }

.actions-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.action-link {
  display: block;
  padding: 10px 14px;
  background: #f4f4f4;
  border-radius: 6px;
  text-decoration: none;
  color: #1a1a2e;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.action-link:hover { background: #e8e8e8; }

.error-banner { background: #ffe0e0; color: #c0392b; padding: 10px 14px; border-radius: 6px; font-size: 0.9rem; margin-top: 10px; }
.success-banner { background: #e0f7e9; color: #27ae60; padding: 10px 14px; border-radius: 6px; font-size: 0.9rem; margin-top: 10px; }
</style>