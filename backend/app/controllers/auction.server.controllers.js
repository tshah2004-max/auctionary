const Joi = require("joi");
const auctions = require("../models/auction.server.model.js");
const db = require("../../database");
const { getIdFromToken } = require('../models/user.server.model');

const search_for_item = (req, res) => {
    const { q, status, limit = 10, offset = 0 } = req.query;
    const token = req.header("X-Authorization");

    const validStatuses = ['OPEN', 'BID', 'ARCHIVE'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error_message: "Invalid status" });
    }

    // OPEN and BID require authentication — check token presence only
    if ((status === 'OPEN' || status === 'BID') && !token) {
        return res.status(400).json({ error_message: "Authentication required for this status filter" });
    }

    const runQuery = (userId) => {
        let conditions = [];
        let params = [];

        if (q) {
            conditions.push(`(i.name LIKE ? OR i.description LIKE ?)`);
            params.push(`%${q}%`, `%${q}%`);
        }

        if (status === 'OPEN') {
            conditions.push(`i.creator_id = ? AND i.end_date > ?`);
            params.push(userId, Date.now());
        } else if (status === 'BID') {
            conditions.push(`i.item_id IN (SELECT item_id FROM bids WHERE user_id = ?)`);
            params.push(userId);
        } else if (status === 'ARCHIVE') {
            conditions.push(`i.end_date < ?`);
            params.push(Date.now());
        }

        let sql = `SELECT i.*, u.first_name, u.last_name 
                   FROM items i JOIN users u ON i.creator_id = u.user_id`;
        if (conditions.length > 0) sql += ` WHERE ` + conditions.join(' AND ');
        sql += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.all(sql, params, (err, rows) => {
            if (err) return res.sendStatus(500);
            return res.status(200).json(rows);
        });
    };

    if (token && (status === 'OPEN' || status === 'BID')) {
        getIdFromToken(token, (err, userId) => {
            if (err || !userId) return res.status(400).json({ error_message: "Invalid token" });
            runQuery(userId);
        });
    } else {
        runQuery(null);
    }
};

const create_item = (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        starting_bid: Joi.number().positive().required(),
        end_date: Joi.number().greater(Date.now()).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error_message: error.details[0].message });

    const auction = {
        name: req.body.name,
        description: req.body.description,
        starting_bid: req.body.starting_bid,
        end_date: req.body.end_date,
        creator_id: req.user_id
    };

    auctions.addNewAuction(auction, (err, id) => {
        if (err) return res.sendStatus(500);
        return res.status(201).json({ item_id: id });
    });
};

const get_single_item = (req, res) => {
    const itemId = parseInt(req.params.item_id);
    if (isNaN(itemId)) return res.sendStatus(400);

    db.get(
        `SELECT i.*, u.first_name, u.last_name 
         FROM items i 
         JOIN users u ON i.creator_id = u.user_id 
         WHERE i.item_id = ?`,
        [itemId],
        (err, row) => {
            if (err) return res.sendStatus(500);
            if (!row) return res.sendStatus(404);

            db.get(
                `SELECT b.amount, b.user_id, u.first_name, u.last_name 
                 FROM bids b 
                 JOIN users u ON b.user_id = u.user_id 
                 WHERE b.item_id = ? 
                 ORDER BY b.amount DESC 
                 LIMIT 1`,
                [itemId],
                (err, bidRow) => {
                    if (err) return res.sendStatus(500);
                    return res.status(200).json({
                        ...row,
                        current_bid: bidRow ? bidRow.amount : row.starting_bid,
                        current_bid_holder: bidRow || null
                    });
                }
            );
        }
    );
};

const place_bid = (req, res) => {
    const schema = Joi.object({
        amount: Joi.number().integer().positive().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error_message: error.details[0].message });

    const itemId = parseInt(req.params.item_id);
    if (isNaN(itemId)) return res.sendStatus(400);

    db.get(`SELECT * FROM items WHERE item_id = ?`, [itemId], (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.sendStatus(404);
        if (item.creator_id === req.user_id) return res.sendStatus(403);
        if (Date.now() > item.end_date) return res.sendStatus(403);

        db.get(`SELECT MAX(amount) as max_bid FROM bids WHERE item_id = ?`, [itemId], (err, row) => {
            if (err) return res.sendStatus(500);
            const currentMax = row.max_bid !== null ? row.max_bid : item.starting_bid;
            if (req.body.amount <= currentMax) {
                return res.status(400).json({ error_message: "Bid must be higher than current highest bid" });
            }

            db.run(`INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?, ?, ?, ?)`,
                [itemId, req.user_id, req.body.amount, Date.now()], (err) => {
                    if (err) return res.sendStatus(500);
                    return res.sendStatus(201);
                });
        });
    });
};

const get_bid_history = (req, res) => {
    const itemId = parseInt(req.params.item_id);
    if (isNaN(itemId)) return res.sendStatus(400);

    db.get(`SELECT * FROM items WHERE item_id = ?`, [itemId], (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.sendStatus(404);

        db.all(
            `SELECT b.item_id, b.amount, b.timestamp, b.user_id, 
                    u.first_name, u.last_name 
             FROM bids b 
             JOIN users u ON b.user_id = u.user_id 
             WHERE b.item_id = ? 
             ORDER BY b.amount DESC`,
            [itemId],
            (err, rows) => {
                if (err) return res.sendStatus(500);
                return res.status(200).json(rows);
            }
        );
    });
};

module.exports = { searchItem: search_for_item, create_item, get_single_item, place_bid, get_bid_history };