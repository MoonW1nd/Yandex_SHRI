const express = require('express');
const graphqlHTTP = require('express-graphql');
const router = express.Router();
const schema = require('./schema').graphqlSchema;

router.use(
  graphqlHTTP({
    schema: schema,
    graphiql: true
  })
);

module.exports = router;
