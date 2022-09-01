const User = require("../models/user");
const Dish = require("../models/dishModel");
const Client = require("../models/clients");
const Order = require("../models/order");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const createToken = (user, secretWord, expiresIn) => {
  const { id, email, name, lastname } = user;
  return jwt.sign({ id, email, name, lastname }, secretWord, { expiresIn });
};

const resolvers = {
  Query: {
    getUser: async (_, {}, context) => {
      console.log(context.user, "context");
      return context.user;
    },
    getMenu: async () => {
      try {
        const dish = await Dish.find({});
        return dish;
      } catch (error) {
        console.log(error);
      }
    },
    getDish: async (_, { id }) => {
      const dishId = await Dish.findById(id);
      if (!dishId) {
        throw new Error("Dish does not exists");
      }
      return dishId;
    },
    getClients: async () => {
      try {
        const clients = await Client.find({});
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClientUser: async (_, {}, context) => {
      console.log(context, "ctx");
      try {
        const clients = await Client.find({
          waiter: context.user.id.toString(),
        });
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClient: async (_, { id }, context) => {
      const client = await Client.findById(id);
      console.log(id, client, "info here");

      if (!client) {
        throw new Error("Client does not exists");
      }
      if (client.waiter.toString() !== context.user.id) {
        throw new Error("Check your credentials");
      }
      return client;
    },
    getOrders: async () => {
      try {
        const order = await Order.find({});
        return order;
      } catch (error) {
        console.log(error);
      }
    },
    getOrder: async (_, { id }, context) => {
      const order = await Order.findById(id);
      console.log("get order:", order);
      if (!order) {
        throw new Error("Order does not exists");
      }
      if (order.waiter.toString() !== context.user.id) {
        throw new Error("Check your credentials");
      }
      return order;
    },
    getOrdersUser: async (_, {}, context) => {
      console.log(context);
      try {
        const order = await Order.find({ waiter: context.user.id });
        return order;
      } catch (error) {
        console.log(error);
      }
    },
    getOrderState: async (_, { state }, context) => {
      const orders = await Order.find({
        waiter: context.user.id,
        state,
      });
      return orders;
    },
    bestClients: async () => {
      const clients = await Order.aggregate([
        { $match: { state: "COMPLETED" } },
        {
          $group: {
            _id: "$client",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreingField: "id",
            as: "client",
          },
        },
      ]);

      return clients;
    },
  },

  Mutation: {
    newOrder: async (_, { input }, context) => {
      const { client } = input;
      console.log(input);
      //check if client exists
      let clientExists = await Client.findById(client);
      if (!clientExists) {
        throw new Error("Client does not exist");
      }

      //Check if the user owns the client
      if (clientExists.waiter.toString() !== context.user.id) {
        throw new Error("Check your credentials");
      }
      // // Check if there is enough dish in the stock

      for await (const item of input.order) {
        const { id } = item;
        const plate = await Dish.findById(id);
        if (item.quantity > plate.inStock) {
          throw new Error(`The Dish: ${plate.dishName} is out of stock`);
        } else {
          //
          plate.inStock = plate.inStock - item.quantity;

          await plate.save();
        }
      }

      //create new order
      const newOrderDish = new Order(input);

      //assing a waiter

      newOrderDish.waiter = context.user.id;

      //save in the dataBase

      const result = await newOrderDish.save();
      return result;
    },
    newUser: async (_, { input }) => {
      const { email, password } = input;

      //check if teh user already exist

      const UserExists = await User.findOne({ email });
      if (UserExists) {
        throw new Error("the user already exists");
      }

      // hash the passsword
      const salt = await bcryptjs.genSaltSync(10);
      input.password = bcryptjs.hashSync(password, salt);

      // save the user
      try {
        const user = new User(input);
        user.save(); // save in the db
        return user;
      } catch (error) {
        console.log(error);
      }
    },
    authUser: async (_, { input }) => {
      const { email, password } = input;
      // verify if email exists
      const userExists = await User.findOne({ email });
      if (!userExists) {
        throw new Error("This user doesn't have an account");
      }

      // verify if the password is correct

      const correctPassword = await bcryptjs.compare(
        password,
        userExists.password
      );
      if (!correctPassword) {
        throw new Error("Wrong password");
      }
      // create the token
      return {
        token: createToken(userExists, process.env.SECRET_WORD, "24h"),
      };
    },
    newDish: async (_, { input }) => {
      console.log(input, "que pasa aqui");
      const { dishName } = input;
      const dishExists = await Dish.findOne({ dishName });
      if (dishExists) {
        throw new Error("Dish already exist");
      }
      try {
        const dish = new Dish(input);
        const result = await dish.save();
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateDish: async (_, { id, input }) => {
      // revisar si el producto existe o no
      let dish = await Dish.findById(id);

      if (!dish) {
        throw new Error("Dish does not exist");
      }

      // guardarlo en la base de datos
      dish = await Dish.findOneAndUpdate({ _id: id }, input, { new: true });
      console.log(dish);
      return dish;
    },
    deleteDish: async (_, { id }) => {
      // revisar si el producto existe o no
      let dishDelete = await Dish.findById(id);

      if (!dishDelete) {
        throw new Error("Dish does not exist");
      }
      await dishDelete.deleteOne({ _id: id });

      return "Dish Delete Succesfull";
    },
    newClient: async (_, { input }, context) => {
      console.log(context, "here the contex", input);
      const { email } = input;
      const client = await Client.findOne({ email });
      if (client) {
        throw new Error("client already exist");
      }
      const NewClient = new Client(input);
      NewClient.waiter = context.user.id;
      try {
        const result = await NewClient.save();
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateClient: async (_, { id, input }, context) => {
      //check if the client exist or not
      let client = await Client.findById(id);
      if (!client) {
        throw new Error("Client does not exist");
      }
      //check if the user is the client owner
      if (client.waiter.toString() !== context.user.id) {
        throw new Error("Check your credentials");
      }
      // save the client
      client = await Client.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return client;
    },
    deleteClient: async (_, { id }, context) => {
      let client = await Client.findById(id);
      if (!client) {
        throw new Error("Client does not exist");
      }
      if (client.waiter.toString() !== context.user.id) {
        throw new Error("Check your credentials");
      }
      client = await Client.findOneAndDelete({ _id: id });
      return "Client was deleted";
    },
    updateOrder: async (_, { id, input }, context) => {
      console.log(id);
      const { client } = input;
      //check if the order exits
      const orderExist = await Order.findById(id);
      if (!orderExist) {
        throw new Error("Order does not exist");
      }
      // check if client exist
      const clientExist = await Client.findById(client);
      if (!clientExist) {
        throw new Error("Client does not exist");
      }

      //check if the waiter owns the order and the client
      if (clientExist.waiter.toString() !== context.user.id) {
        throw new Error("Check your credentials");
      }
      // Check if there is enough dish in the stock
      if (input.order) {
        for await (const item of input.order) {
          const { id } = item;
          const plate = await Dish.findById(id);
          if (item.quantity > plate.inStock) {
            throw new Error(`The Dish: ${plate.dishName} is out of stock`);
          } else {
            //
            plate.inStock = plate.inStock - item.quantity;

            await plate.save();
          }
        }
      }

      // save the order

      const result = await Order.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return result;
    },
    deleteOrder: async (_, { id }, context) => {
      let order = await Order.findById(id);
      if (!order) {
        throw new Error("Order does not exist");
      }
      if (order.waiter.toString() !== context.user.id) {
        throw new Error("Check your credentials");
      }
      await Order.findOneAndDelete({ _id: id });
      return "Order was deleted";
    },
  },
};

module.exports = resolvers;
