const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
// Key to connect to database
const { MONGODB } = require("./config.js");

// Config the server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }), // forwarding request body into context,
  //now we can access that req body to access header and authenticate user
});

// Connects Mongo DB
mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`MongoDB Connected`);
    return server.listen({ port: 5000 });
  })
  .then((res) => {
    console.log(`Server Up and Running at ${res.url}`);
  });
