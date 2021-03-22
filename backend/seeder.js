import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';

dotenv.config(); //we'll be using env variables

connectDB(); //to connect to mongoDB via mongoose;

const importData = async () => {
  //function to import data
  try {
    await Order.deleteMany(); //deletes everything
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users); //array of created users

    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map(product => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Data Imported'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit();
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
