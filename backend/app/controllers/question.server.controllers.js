const Joi = require("joi");
const db = require("../../database");

const get_questions = (req, res) => {
    const itemId = parseInt(req.params.item_id);
    if (isNaN(itemId)) return res.sendStatus(400);

    db.get(`SELECT * FROM items WHERE item_id = ?`, [itemId], (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.sendStatus(404);

        db.all(
    `SELECT question_id, question AS question_text, answer AS answer_text, asked_by, item_id 
 FROM questions WHERE item_id = ? ORDER BY question_id DESC`,
    [itemId],
    (err, rows) => {
        if (err) return res.sendStatus(500);
        return res.status(200).json(rows);
            });
    });
};

const ask_question = (req, res) => {
    // Accept both 'question' and 'question_text' field names
    const question_text = req.body.question || req.body.question_text;

    if (!question_text || question_text.trim() === '') {
        return res.status(400).json({ error_message: "Question is required" });
    }

    // Reject extra fields
    const allowed = ['question', 'question_text'];
    const extra = Object.keys(req.body).filter(k => !allowed.includes(k));
    if (extra.length > 0) {
        return res.status(400).json({ error_message: "Extra fields not allowed" });
    }

    const itemId = parseInt(req.params.item_id);
    if (isNaN(itemId)) return res.sendStatus(400);

    db.get(`SELECT * FROM items WHERE item_id = ?`, [itemId], (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.sendStatus(404);

        if (item.creator_id === req.user_id) return res.sendStatus(403);

        db.run(`INSERT INTO questions (question, asked_by, item_id) VALUES (?, ?, ?)`,
            [question_text, req.user_id, itemId],
            function(err) {
                if (err) return res.sendStatus(500);
                return res.status(200).json({ question_id: this.lastID });
            });
    });
};

const answer_question = (req, res) => {
    // Accept both 'answer' and 'answer_text'
    const answer_text = req.body.answer || req.body.answer_text;

    if (!answer_text || answer_text.trim() === '') {
        return res.status(400).json({ error_message: "Answer is required" });
    }

    // Reject extra fields
    const allowed = ['answer', 'answer_text'];
    const extra = Object.keys(req.body).filter(k => !allowed.includes(k));
    if (extra.length > 0) {
        return res.status(400).json({ error_message: "Extra fields not allowed" });
    }

    const questionId = parseInt(req.params.question_id);
    if (isNaN(questionId)) return res.sendStatus(400);

    db.get(`SELECT q.*, i.creator_id FROM questions q 
            JOIN items i ON q.item_id = i.item_id 
            WHERE q.question_id = ?`, [questionId], (err, row) => {
        if (err) return res.sendStatus(500);
        if (!row) return res.sendStatus(404);
        if (row.creator_id !== req.user_id) return res.sendStatus(403);

        db.run(`UPDATE questions SET answer = ? WHERE question_id = ?`,
            [answer_text, questionId], (err) => {
                if (err) return res.sendStatus(500);
                return res.sendStatus(200);
            });
    });
};

module.exports = { get_questions, ask_question, answer_question };