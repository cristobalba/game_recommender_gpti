const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const dotenv = require('dotenv');

dotenv.config();

// Aauthentication middleware
const auth = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

module.exports = auth;
