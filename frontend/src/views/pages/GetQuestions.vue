<template>
    <h1>Questions</h1>

    <div v-if="loading">Loading Question...</div>
    <div v-if="error">{{ error }}</div>

        <div v-for="q in questions" :key="q.questions_id">
        <p>Question Id: {{ q.question_id }}</p>
        <p>Question: {{ q.question_text }}</p>
        <p>Answer: {{ q.answer_text }}</p>
    </div>
    <form @submit.prevent="handleSubmit">
        <div>
        <label for="question">Question: </label>
        <input type="text" id="question" v-model="newQuestion"  placeholder="Type your question" />
        </div>
                        &nbsp;&nbsp;
        <div>
        <button type="submit">Ask question</button>
        <div v-if="submitError">{{ submitError }}</div>
        <div v-if="submitSuccess">{{ submitSuccess }}></div>
        </div>
    </form>
</template>

<script>
    import { coreService } from '@/services/core.service';
    export default {
    data() {
        return {
                loading: false,
                questions: [],
                newQuestion: "",
            error: ""
        };
    },
    mounted() {
        const itemId = this.$route.params.id;
        this.loading = true;

        coreService.getQuestions(itemId)
            .then(response => {
                    this.question = response;
                    this.loading = false;
                })
            .catch(err => {
                this.error = err;
                this.loading = false;
            })
    }
};
</script>