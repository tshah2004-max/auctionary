<template>
<h1> {{ item.name }} </h1>
<h2> {{ item.description }} </h2>
<h2> Starting Bid: £{{ item.starting_bid }} </h2>
<h2> Current Bid: £{{ item.current_bid || item.starting_bid }} </h2>
<h2> Ends: {{ new Date(item.end_date).toLocaleDateString('en-GB') }} </h2>

<form @submit.prevent>
     <input type="number" v-model="bidAmount" placeholder="Enter bid amount"/>
     <button @click="handleBid">Place Bid</button>
</form>

<div v-if="error">{{ error }}</div>
<div v-if="bidSuccess">{{ bidSuccess }}</div>
</template>

<script>
export default {
  data() {
    return{
      item: {},
      loading: true,
      error: "",
      bidAmount: null,
      bidSuccess: "",
    }
  },
  mounted() {
    this.fetchItem()
  },
  methods: {
    fetchItem() {
      fetch(`http://localhost:3333/item/${this.$route.params.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
      .then(response => {
        if(response.status === 200) return response.json()
      })
      .then(data => {
        this.item = data
        this.loading = false
      })
      .catch(err => { this.error = err })
    },
    handleBid() {
      this.error = ""
      this.bidSuccess = ""
      fetch(`http://localhost:3333/item/${this.$route.params.id}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": localStorage.getItem("session_token")
        },
        body: JSON.stringify({ amount: this.bidAmount })
      })
      .then(response => {
        if(response.status === 201 || response.status === 200) {
          this.bidSuccess = "Bid placed successfully!"
          this.fetchItem()
        } else {
          return response.json().then(err => { throw err.error_message || 'Something went wrong' })
        }
      })
      .catch(err => { this.error = err })
    }
  }
}
</script>