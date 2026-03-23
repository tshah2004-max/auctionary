const crypto = require ("crypto"); 
const db = require("../../database");
const { error } = require("console");
const addNewAuction = (auction, done) => {
    const salt =crypto.randomBytes(64);

const sql = 'INSERT INTO items (name, description, starting_bid, start_date, end_date, creator_id) VALUES (?,?,?,?,?,?)'
let values = [auction.name, auction.description, auction.starting_bid, Date.now(), auction.end_date, auction.creator_id ];

db.run(sql,values, function(err){
     if(err) return done(err, null);
     return done(null, this.lastID);
})
}

module.exports= {
    addNewAuction
}