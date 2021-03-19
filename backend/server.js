const express = require('express');
const products = require('./data/products');

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

app.listen(5000, console.log('Server running on port 5000'));
