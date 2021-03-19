import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import products from './data/products.js';

dotenv.config();

connectDB();

const app = express();

app.get('/', (req, res) => {
  res.send('API IS RUNNING...');
});
//1. get request to '/'
//2. runs function that takes in 2 objects, req, res
//3.  response object, call send ->

app.get('/api/products', (req, res) => {
  res.json(products); //products is not json when passed in. wrap it in res.json to return json version
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  res.json(product);
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
