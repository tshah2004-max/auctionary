const users = require("../controllers/user.server.controllers.js");
const auth = require("../libs/authentication.js");

module.exports = function(app) {
    app.route("/users")
        .post(users.create_account);

    app.route("/login")
        .post(users.login);

    app.route("/logout")
        .post(auth.isAuthenticated, users.logout);

    app.route("/users/:user_id")
        .get(users.get_users_information); // no auth required
};