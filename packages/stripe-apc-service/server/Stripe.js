const Stripe = require('stripe');
const config = require("config");

const sk = config.get("stripe.secretKey");

module.exports = sk ? Stripe(sk) : null;