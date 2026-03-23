const auctions = require("../controllers/auction.server.controllers.js");
const auth = require("../libs/authentication.js");

module.exports = function(app) {
    app.route("/search")
        .get(auctions.searchItem);

    app.route("/item")
        .post(auth.isAuthenticated, auctions.create_item);

    app.route("/item/:item_id")
        .get(auctions.get_single_item);

    app.route("/item/:item_id/bid")
        .post(auth.isAuthenticated, auctions.place_bid)
        .get(auctions.get_bid_history);
};