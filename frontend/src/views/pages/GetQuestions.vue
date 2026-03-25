<template>
  <div class="page">
    <h1>❓ Questions & Answers</h1>
    <p class="subtitle" v-if="itemName">For: <strong>{{ itemName }}</strong></p>

    <div v-if="loadingQuestions" class="loading">Loading questions...</div>

    <div v-if="!loadingQuestions && questions.length === 0" class="empty">
      No questions yet. Be the first to ask!
    </div>

    <div class="questions-list" v-if="questions.length > 0">
      <div class="question-card" v-for="q in questions" :key="q.question_id">
        <div class="question-meta">
          <span class="question-author">{{ q.first_name }} {{ q.last_name }}</span>
          <span class="question-badge">Q</span>
        </div>
        <p class="question-text">{{ q.question }}</p>
        <div class="answer" v-if="q.answer">
          <span class="answer-badge">A</span>
          <p>{{ q.answer }}</p>
        </div>
        <div class="no-answer" v-else>
          <em>No answer yet</em>
          <div v-if="isCreator">
            <input v-model="answerInputs[q.question_id]" type="text" placeholder="Type your answer..." class="answer-input" />
            <button class="answer-btn" @click="submitAnswer(q.question_id)">Post Answer</button>
          </div>
        </div>
      </div>
    </div>

    <div class="ask-section" v-if="!isCreator && isLoggedIn">
      <h2>Ask a Question</h2>
      <textarea v-model="newQuestion" rows="3" placeholder="What would you like to know about this car?"></textarea>
      <div v-if="questionError" class="error-banner">{{ questionError }}</div>
      <div v-if="questionSuccess" class="success-banner">{{ questionSuccess }}</div>
      <button class="submit-btn" @click="submitQuestion">Submit Question</button>
    </div>

    <div class="login-prompt" v-if="!isLoggedIn">
      <router-link to="/login">Log in</router-link> to ask a question.
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      questions: [],
      newQuestion: "",
      answerInputs: {},
      itemName: "",
      isCreator: false,
      isLoggedIn: false,
      loadingQuestions: true,
      questionError: "",
      questionSuccess: ""
    }
  },
  mounted() {
    const userId = localStorage.getItem("user_id");
    this.isLoggedIn = !!localStorage.getItem("session_token");

    // Get item details to check if current user is creator
    fetch(`http://localhost:3333/item/${this.$route.params.id}`)
      .then(r => r.json())
      .then(data => {
        this.itemName = data.name;
        this.isCreator = userId && parseInt(userId) === data.creator_id;
      });

    this.loadQuestions();
  },
  methods: {
    loadQuestions() {
      this.loadingQuestions = true;
      fetch(`http://localhost:3333/item/${this.$route.params.id}/questions`)
        .then(r => {
          if (r.status === 404) throw "Item not found";
          return r.json();
        })
        .then(data => {
          this.questions = data;
          this.loadingQuestions = false;
        })
        .catch(() => {
          this.loadingQuestions = false;
        });
    },
    submitQuestion() {
      this.questionError = "";
      this.questionSuccess = "";
      if (!this.newQuestion.trim()) {
        this.questionError = "Question cannot be empty.";
        return;
      }
      const token = localStorage.getItem("session_token");
      fetch(`http://localhost:3333/item/${this.$route.params.id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": token
        },
        body: JSON.stringify({ question: this.newQuestion.trim() })
      })
      .then(r => {
        if (r.status === 200) return;
        else if (r.status === 403) throw "You cannot ask questions on your own listing.";
        else if (r.status === 400) throw "Invalid question.";
        else throw "Something went wrong.";
      })
      .then(() => {
        this.questionSuccess = "Question posted!";
        this.newQuestion = "";
        this.loadQuestions();
      })
      .catch(err => {
        this.questionError = typeof err === "string" ? err : "Something went wrong.";
      });
    },
    submitAnswer(questionId) {
      const answer = this.answerInputs[questionId];
      if (!answer || !answer.trim()) return;
      const token = localStorage.getItem("session_token");
      fetch(`http://localhost:3333/item/${this.$route.params.id}/questions/${questionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": token
        },
        body: JSON.stringify({ answer: answer.trim() })
      })
      .then(r => {
        if (r.status === 200) {
          this.answerInputs[questionId] = "";
          this.loadQuestions();
        } else {
          throw "Could not post answer.";
        }
      })
      .catch(err => console.log(err));
    }
  }
}
</script>

<style scoped>
.page {
  max-width: 700px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Segoe UI', sans-serif;
}

h1 { color: #1a1a2e; font-size: 1.8rem; margin-bottom: 6px; }
.subtitle { color: #555; margin-bottom: 24px; }
.loading, .empty { color: #888; margin: 20px 0; }

.questions-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }

.question-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.question-author { font-weight: 600; color: #333; font-size: 0.9rem; }

.question-badge {
  background: #1a1a2e;
  color: white;
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 700;
}

.question-text { margin: 0 0 10px; color: #222; }

.answer {
  display: flex;
  gap: 10px;
  background: #eaf4ff;
  border-radius: 6px;
  padding: 10px;
  align-items: flex-start;
}

.answer-badge {
  background: #e63946;
  color: white;
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

.answer p { margin: 0; color: #333; }
.no-answer { display: flex; flex-direction: column; gap: 8px; }
.no-answer em { color: #aaa; font-size: 0.85rem; }

.answer-input {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
}

.answer-btn {
  background: #1a1a2e;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 4px;
}

.answer-btn:hover { background: #2e2e4e; }

.ask-section { border-top: 1px solid #e0e0e0; padding-top: 24px; }
.ask-section h2 { font-size: 1.2rem; color: #1a1a2e; margin-bottom: 12px; }

textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  resize: vertical;
}

textarea:focus { outline: none; border-color: #e63946; }

.submit-btn {
  background: #e63946;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

.submit-btn:hover { background: #c0392b; }

.error-banner { background: #ffe0e0; color: #c0392b; padding: 8px 12px; border-radius: 6px; font-size: 0.9rem; margin-top: 8px; }
.success-banner { background: #e0f7e9; color: #27ae60; padding: 8px 12px; border-radius: 6px; font-size: 0.9rem; margin-top: 8px; }
.login-prompt { margin-top: 24px; color: #555; }
.login-prompt a { color: #e63946; font-weight: 600; }
</style>