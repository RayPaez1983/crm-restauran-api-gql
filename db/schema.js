const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID
    name: String
    lastname: String
    email: String
    created: String
  }
  type Token {
    token: String
  }
  type Dish {
    id: ID
    dishName: String
    protein: String
    carbohydrates: String
    vegetables: String
    inStock: Int
    price: Float
    created: String
  }
  type Client {
    id: ID
    name: String
    lastname: String
    email: String
    phoneNumber: String
    order: String
    created: String
    waiter: ID
  }
  type OrderGroup {
    id: ID
    quantity: Int
  }
  type Order {
    id: ID
    order: [OrderGroup]
    total: Float
    client: ID
    waiter: ID
    created: String
    state: OrderState
  }

  type TopClient {
    total: Float
    client: [User]
  }

  type TopWaiter {
    total: Float
    waiter: [Client]
  }

  input userInput {
    name: String!
    lastname: String!
    email: String!
    password: String!
  }
  input authInput {
    email: String!
    password: String!
  }
  input dishInput {
    dishName: String!
    protein: String!
    carbohydrates: String!
    vegetables: String!
    inStock: Int!
    price: Float!
  }
  input dishInputUpdate {
    dishName: String
    protein: String
    carbohydrates: String
    vegetables: String
    inStock: Int
    price: Float
  }
  input clientInput {
    name: String!
    lastname: String!
    email: String!
    phoneNumber: String
    order: String!
  }

  input OrderGroupInput {
    id: ID
    quantity: Int
  }
  input OrderInput {
    order: [OrderGroupInput]
    total: Float!
    client: ID!
    state: OrderState
  }
  enum OrderState {
    PENDING
    COMPLETED
    CANCELLED
  }

  type Query {
    getUser(token: String!): User
    getUsers: [User]

    getMenu: [Dish]
    getDish(id: ID!): Dish

    getClients: [Client]
    getClientUser: [Client]
    getClient(id: ID!): Client

    getOrders: [Order]
    getOrdersUser: [Order]
    getOrder(id: ID!): Order
    getOrderState(state: String!): [Order]

    bestClients: [TopClient]
    bestWaiter: [TopWaiter]
    searchDish(text: String!): [Dish]
  }
  type Mutation {
    #products
    newDish(input: dishInput): Dish
    updateDish(id: ID!, input: dishInputUpdate): Dish
    deleteDish(id: ID!): String

    newUser(input: userInput): User
    authUser(input: authInput): Token

    newClient(input: clientInput): Client
    updateClient(id: ID!, input: clientInput): Client
    deleteClient(id: ID!): String
    deleteUser(id: ID!): String

    newOrder(input: OrderInput): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String
  }
`;
module.exports = typeDefs;
