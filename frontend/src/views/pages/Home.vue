<template>
  <h1>Home</h1>
  <h2 v-if="loading">Loading items</h2>
  <ul>
    <li v-for="item in items" :key="item.item_id">
    <router-link :to="'/item/' + item.item_id">{{ item.name }}</router-link>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return{
      items: [],
      loading: true,
      error: "",
    }
  },
  mounted() {
            fetch ("http://localhost:3333/search",{
                method: "GET",
                headers:{
                    "Content-Type": "application/json"
                },
            })
            .then(response => {
                if(response.status === 200) {
                    return response.json()
                }
            })
            .then(data => {
              this.items = data;
              this.loading = false
            })
            .catch(err => {
            console.log("Error:", err)
        })
    }
}
</script>