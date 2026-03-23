const questions = require("../controllers/question.server.controllers.js");
const auth = require("../libs/authentication.js");

module.exports = function(app) {
    app.route("/item/:item_id/question")
        .get(questions.get_questions)
        .post(auth.isAuthenticated, questions.ask_question);

    app.route("/question/:question_id")
        .post(auth.isAuthenticated, questions.answer_question);
};