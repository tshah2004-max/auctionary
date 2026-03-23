<template>
    <h1>Login</h1>
    <form @submit.prevent>
    <h2>Email</h2>
    <input type="email" v-model="email" placeholder="your@email.com"/>
    <h2>Password</h2>
    <input type="password" v-model="password" placeholder="Password"/>
    <br>
    <br>
    <button @click="handleLogin">Login</button>
    </form>

    <div v-if="error">{{ error }}</div>
</template>

<script>
    export default {
            data (){
                return{
                    email: "",
                    password: "",
                    error: "",
        }
    },
    methods: {
        handleLogin(){
            fetch ("http://localhost:3333/login",{
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            })
            .then(response => {
                if(response.status === 200) {
                    return response.json()
                } else if (response.status === 400) {
                     throw 'Invalid email or password'
                } else {
                    throw 'Something went wrong'
                }
            })
            .then(data => {
                localStorage.setItem("user_id", data.user_id)
                localStorage.setItem("session_token", data.session_token)
                this.$router.push("/")
            })
            .catch(err => {
            console.log("Error:", err)
        })
        }
    }
    }
</script>