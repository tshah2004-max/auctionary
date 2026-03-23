<template>
    <h1>User information</h1>
    
    <div v-if="loading">Loading user...</div>
    <div v-if="error">{{ error }}</div>

    <div v-if="user">
        <p>User Id: {{ user.user_id }}</p>
        <p>First Name: {{ user.first_name }}</p>
        <p>Last Name: {{ user.last_name }}</p>


    <div v-if="user.selling && user.selling.length">
        <h2>Items selling: </h2>
        <ul>
            <li v-for="item in user.selling" :key="item.item_id">
                <p>Item Id: {{ item.item_id }}</p>
                <p>Name: {{ item.name }}</p>
                <p>description: {{ item.description }}</p>
                <p>End Date: {{ item.end_date }}</p>
                <p>Creator ID: {{ item.creator_id }}</p>
            </li>
        </ul>

        <div v-if="user.bidding_on && user.bidding_on.length">
        <h2>Bidding On: </h2>
        <ul>
            <li v-for="item in user.bidding_on" :key="item.item_id">
                <p>Item Id: {{ item.item_id }}</p>
                <p>Name: {{ item.name }}</p>
                <p>description: {{ item.description }}</p>
                <p>End Date: {{ item.end_date }}</p>
                <p>Creator ID: {{ item.creator_id }}</p>
            </li>
        </ul>
        <div v-if="user.auctions_ended && user.auctions_ended.length">
        <h2>Auction Ended: </h2>
        <ul>
            <li v-for="item in user.auctions_ended" :key="item.item_id">
                <p>Item Id: {{ item.item_id }}</p>
                <p>Name: {{ item.name }}</p>
                <p>description: {{ item.description }}</p>
                <p>End Date: {{ item.end_date }}</p>
                <p>Creator ID: {{ item.creator_id }}</p>
            </li>
        </ul>
        </div>
        </div>
        </div>
    </div>
</template>

<script>
    import { coreService } from '@/services/core.service';

export default{
        data() {
            return {
                user: null,
                loading: true,
                error: ""
            };
        },
        mounted() {
            this.fetchUser();
        },
        methods: {
            async fetchUser(){
                this.loading = true;
                this.error = "";

                try{
                const token = localStorage.getItem("session_token");
                const userId = localStorage.getItem("user_id"); 

                if (!userId) throw new Error("No user logged in");  

                const res = await fetch(`http://localhost:3333/users/${userId}`, {
                    headers: {
                        "X-Authorization": token,
                        "Content-Type": "application/json"
                    }
                });

                if(!res.ok){
                    if (res.status === 404) {
                        throw new Error("User not found");
                    }else{
                        throw new Error("Failed to fetch user information")
                    }
                }

                this.user = await res.json();  
            }catch(err)  {
                        console.log("Err", err);
                        this.error = err.message;
            } finally {
                this.loading = false;
            }
        }
                }

    }
</script>