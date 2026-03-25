<template>
  <div class="page">
    <h1>🚗 List a Car for Auction</h1>
    <form class="form" @submit.prevent="handleSubmit">

      <div class="form-group">
        <label>Car Name / Title</label>
        <input type="text" v-model.trim="name" placeholder="e.g. 2019 BMW M3 Competition" />
        <div class="error-msg" v-show="submitted && !name">Car name is required</div>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model.trim="description" rows="4" placeholder="Mileage, condition, service history..."></textarea>
        <div class="error-msg" v-show="submitted && !description">Description is required</div>
      </div>

      <div class="form-group">
        <label>Starting Bid (£)</label>
        <input type="number" v-model="starting_bid" placeholder="e.g. 5000" min="1" />
        <div class="error-msg" v-show="submitted && !starting_bid">Starting bid is required</div>
      </div>

      <div class="form-group">
        <label>Auction End Date & Time</label>
        <input type="datetime-local" v-model="end_date_input" />
        <div class="error-msg" v-show="submitted && !end_date_input">End date is required</div>
        <div class="error-msg" v-show="submitted && end_date_input && endDateInPast">End date must be in the future</div>
      </div>

      <div v-if="error" class="error-banner">{{ error }}</div>
      <div v-if="success" class="success-banner">{{ success }}</div>

      <button type="submit" class="submit-btn">List Car for Auction</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      description: "",
      starting_bid: "",
      end_date_input: "",
      submitted: false,
      error: "",
      success: ""
    }
  },
  computed: {
    endDateInPast() {
      if (!this.end_date_input) return false;
      return new Date(this.end_date_input).getTime() <= Date.now();
    }
  },
  methods: {
    handleSubmit() {
      this.submitted = true;
      this.error = "";
      this.success = "";

      if (!this.name || !this.description || !this.starting_bid || !this.end_date_input) {
        this.error = "Please fill in all fields.";
        return;
      }
      if (this.endDateInPast) {
        this.error = "End date must be in the future.";
        return;
      }

      const token = localStorage.getItem("session_token");
      if (!token) {
        this.$router.push("/login");
        return;
      }

      fetch("http://localhost:3333/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": token
        },
        body: JSON.stringify({
          name: this.name,
          description: this.description,
          starting_bid: parseFloat(this.starting_bid),
          end_date: new Date(this.end_date_input).getTime()
        })
      })
      .then(response => {
        if (response.status === 201) return response.json();
        else if (response.status === 401) throw "You must be logged in to list a car.";
        else if (response.status === 400) throw "Invalid details. Please check your inputs.";
        else throw "Something went wrong. Please try again.";
      })
      .then(data => {
        this.success = "Car listed successfully! Redirecting...";
        setTimeout(() => this.$router.push("/item/" + data.item_id), 1500);
      })
      .catch(err => {
        this.error = typeof err === "string" ? err : "Something went wrong.";
      });
    }
  }
}
</script>

<style scoped>
.page {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  font-size: 1.8rem;
  color: #1a1a2e;
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

input, textarea {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #e63946;
}

.error-msg {
  color: #e63946;
  font-size: 0.82rem;
}

.error-banner {
  background: #ffe0e0;
  color: #c0392b;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.success-banner {
  background: #e0f7e9;
  color: #27ae60;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.submit-btn {
  background: #e63946;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #c0392b;
}
</style>