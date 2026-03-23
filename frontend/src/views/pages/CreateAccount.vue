<template>
        <div>
            <h1>Create an Account</h1>
            <form class="form" @submit.prevent="handleSubmit">
                <div class="form-group">
                <label for="first_name">First Name: </label>
                <input type="text" v-model.trim="first_name" />
                <div v-show="submitted && !first_name">First Name is required</div> 
                </div>
                <div class="form-group">
                <label for="last_name">Last Name: </label>
                <input type="text" v-model.trim="last_name" />
                <div v-show="submitted && !last_name">Last Name is required</div>
                </div>

                <div class="form-group">
               <label for="email">Email: </label>
                <input type="email" name="email" v-model.trim="email" />
                <div v-show="submitted && !email">Email  is required</div>
                </div>

                <div class="form-group">
                 <label for="password">Password: </label>
                <input type="password" name="password" v-model="password" />
                <div v-show="submitted && !password">Password is required</div>
                </div>

                <div class="form-group">
                <button type="submit">Create Account</button>
                </div>
                        </form>

            <div v-if="error">{{ error }}</div>
            <div v-if="success" class="success">{{ success }}</div>
        </div>
    </template>

 <script>
import { coreService } from "@/services/core.service";

export default {
    data() {
        return {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            submitted: false,
            error: "",
            success: ""
        }
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            this.error = "";
            this.success = "";

            if (!this.first_name || this.first_name.length < 3) {
                this.error = "First Name must be at least 3 characters.";
                return;
            }
            if (!this.last_name || this.last_name.length < 3) {
                this.error = "Last Name must be at least 3 characters.";
                return;
            }
            if (!this.email) {
                this.error = "Email is required.";
                return;
            }

            const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
            if (!password_pattern.test(this.password)) {
                this.error = "Password must be 8+ chars with uppercase, number and symbol.";
                return;
            }

            coreService.CreateAccount(
                this.first_name,
                this.last_name,
                this.email,
                this.password
            )
            .then(res => {
                this.success = "Account created! Redirecting...";
                setTimeout(() => this.$router.push("/login"), 1500);
            })
            .catch(err => {
                this.error = "Email already in use or invalid details.";
            });
        }
    }
}
</script>

<style scoped>
        .form {
            display : flex;
            flex-direction:  column;
            gap: 10px;
            max-width: 400px;
        }

        .form-group {
            display : flex;
            align-items: center;
            gap: 10px;
        }

        .form-group label {
            width: 80px;
            text-align: left;
        }

    </style>