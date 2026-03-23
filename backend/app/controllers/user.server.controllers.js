const Joi = require("joi");
const users = require("../models/user.server.model");
const db = require("../../database");

const create_account = (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().min(1).max(100).required(),
        last_name: Joi.string().min(1).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(30)
            .pattern(/[a-z]/, 'lowercase')
            .pattern(/[A-Z]/, 'uppercase')
            .pattern(/[0-9]/, 'number')
            .pattern(/[@$!%*?&]/, 'special')
            .required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error_message: error.details[0].message });

    const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password
    };

    users.addNewUser(user, (err, id) => {
        if (err === 400) return res.status(400).json({ error_message: "Email already exists" });
        if (err) return res.sendStatus(500);
        return res.status(201).json({ user_id: id });
    });
};

const login = (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error_message: error.details[0].message });

    users.authenticateUser(req.body.email, req.body.password, (err, id) => {
        if (err === 404) return res.status(400).json({ error_message: "Invalid email/password" }); // 400 not 404
        if (err) return res.sendStatus(500);

        users.getToken(id, (err, token) => {
            if (err) return res.sendStatus(500);
            if (token) {
                return res.status(200).json({ user_id: id, session_token: token });
            } else {
                users.setToken(id, (err, newToken) => {
                    if (err) return res.sendStatus(500);
                    return res.status(200).json({ user_id: id, session_token: newToken });
                });
            }
        });
    });
};

const logout = (req, res) => {
    const token = req.header("X-Authorization");
    if (!token) return res.sendStatus(401);
    users.removeToken(token, (err) => {
        if (err) return res.sendStatus(500);
        return res.sendStatus(200);
    });
};

const get_users_information = (req, res) => {
    const userId = parseInt(req.params.user_id);

    db.get(`SELECT user_id, first_name, last_name FROM users WHERE user_id = ?`, [userId], (err, user) => {
        if (err) return res.sendStatus(500);
        if (!user) return res.sendStatus(404);

        db.all(`SELECT i.item_id, i.name, i.description, i.starting_bid, i.start_date, i.end_date, 
                       i.creator_id, u.first_name, u.last_name
                FROM items i JOIN users u ON i.creator_id = u.user_id
                WHERE i.creator_id = ?`, [userId], (err, selling) => {
            if (err) return res.sendStatus(500);

            db.all(`SELECT DISTINCT i.item_id, i.name, i.description, i.starting_bid, i.start_date, 
                           i.end_date, i.creator_id, u.first_name, u.last_name
                    FROM items i
                    JOIN bids b ON i.item_id = b.item_id
                    JOIN users u ON i.creator_id = u.user_id
                    WHERE b.user_id = ?`, [userId], (err, bidding) => {
                if (err) return res.sendStatus(500);

                db.all(`SELECT i.item_id, i.name, i.description, i.starting_bid, i.start_date, 
                               i.end_date, i.creator_id, u.first_name, u.last_name
                        FROM items i JOIN users u ON i.creator_id = u.user_id
                        WHERE i.creator_id = ? AND i.end_date < ?`,
                    [userId, Date.now()], (err, ended) => {
                    if (err) return res.sendStatus(500);

                    return res.status(200).json({
                        ...user,
                        selling: selling || [],
                        bidding_on: bidding || [],
                        auctions_ended: ended || []
                    });
                });
            });
        });
    });
};

module.exports = { create_account, login, logout, get_users_information };