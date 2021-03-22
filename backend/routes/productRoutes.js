import express from 'express';
import asyncHandler from 'express-async-handler';
const router = express.Router();
import Product from '../models/productModel';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await Product.find({}); //gives us everything

    res.json(products);
  })
);

// @desc    Fetch single product by id
// @route   GET /api/products/:id
// @access  Public
router.get(
  '/api/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.find(p => p._id === req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product Not Found' });
    }
  })
);

export default router;
