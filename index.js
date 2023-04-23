const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
require('dotenv').config();

//connect to the data base
connectDB();
//server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || '';
    if (token) {
      try {
        const user = jwt.verify(
          token.replace('Bearer', ''),
          process.env.SECRET_WORD
        );
        return {
          user,
        };
      } catch (error) {
        console.log(error);
      }
    }
  },
});

//arrancar el servidor
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`server is running on port ${url}`);
});
