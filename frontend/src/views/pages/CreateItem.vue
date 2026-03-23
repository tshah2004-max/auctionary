import 
   
   <template>
        <div>
            <h1>Create an Item</h1>
            <form class= "form" @submit.prevent="handleSubmit">
                <div class="form-group">
                <label for="Name">Name: </label>
                <input type="Name" id="name" v-model="item.name" />
                </div>
                &nbsp;&nbsp;
                <div class="form-group">
                <label for="description">Description: </label>
                <textarea type="description" v-model="item.description"></textarea>
                </div>
                &nbsp;&nbsp;
                <div class="form-group">
                <label for="starting_bid">Starting Bid: </label>
                <input type="number" id="starting_bid" v-model.number="item.starting_bid" />
                </div>
                &nbsp;&nbsp;
                <div class="form-group">
                <label for="end_date">End Date: </label>
                <input type="date" id="end_date" v-model="item.end_date" />
                </div>
                &nbsp;&nbsp;
                <div>
                <button type="submit">Create Item</button>
                </div>
                        </form>

            <div v-if="error">{{ error }}</div>
            <div v-if="success" class="success">{{ success }}</div>
        </div>
    </template>

    <script>
        import { coreService } from '@/services/core.service';

        export default {
        data() {
            return {
                item: {
                    name: "",
                    description: "",
                    starting_bid: 0,
                    end_date: ""
                },
                error: "",
                success: ""
            };
        },
        methods: {
            handleSubmit() {
                this.error = "";
                this.success = "";

            coreService.createItem({
                    name: this.item.name,
                    description: this.item.description,
                    starting_bid: this.item.starting_bid,
                    end_date: new Date(this.item.end_date).getTime()
                    })
                    .then(res => {
                        this.success = "Item created succesfully Item ID: " + res.item_id;
                    })
                .catch(err => {
                    this.error = err;
                });
        }
    }
    };

    </script>

    <style scoped>
        .form {
            display : flex;
            flex-direction:  column;
            gap: 12px;
            max-width: 400px;
        }

        .form-group {
            display : flex;
            align-items: center;
            gap: 12px;
        }

        .form-group label {
            width: 90px;
            text-align: left;
        }

    </style>