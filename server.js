<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// 🧱 Custom Error Classes
// ===============================
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

// ===============================
// 1️⃣ Custom Logger Middleware
// ===============================
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};
app.use(logger);

// ===============================
// 2️⃣ Middleware to Parse JSON Request Bodies
// ===============================
app.use(express.json());

// ===============================
// 3️⃣ Authentication Middleware
// ===============================
const authenticate = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  const validKey = process.env.API_KEY;

  if (!validKey) {
    console.warn("⚠️ Warning: API_KEY not set in .env file");
  }

  if (!apiKey || apiKey !== validKey) {
    return next(new UnauthorizedError('Invalid or missing API key'));
  }
  next();
};

// ===============================
// 4️⃣ Validation Middleware for Product Data
// ===============================
const validateProduct = (req, res, next) => {
  const { name, price, category } = req.body;

  if (!name || typeof name !== 'string') {
    return next(new ValidationError('Invalid product name'));
  }
  if (price === undefined || typeof price !== 'number') {
    return next(new ValidationError('Invalid product price'));
  }
  if (!category || typeof category !== 'string') {
    return next(new ValidationError('Invalid product category'));
  }

  next();
};

// ===============================
// 5️⃣ Sample Product Data
// ===============================
let products = [
  { id: '1', name: 'Laptop', description: 'A nice laptop', price: 1200, category: 'Electronics', inStock: true },
  { id: '2', name: 'Phone', description: 'Smartphone', price: 800, category: 'Electronics', inStock: true },
  { id: '3', name: 'Book', description: 'Inspirational book', price: 20, category: 'Books', inStock: true },
  { id: '4', name: 'Headphones', description: 'Noise-cancelling', price: 200, category: 'Electronics', inStock: true },
];

// ===============================
// 6️⃣ ROUTES
// ===============================

=======
// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

>>>>>>> 1a4e41a301c983ea6d867f1abbb13e1ae2efbbed
// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

<<<<<<< HEAD
// ✅ GET all products (filter + pagination)
app.get('/api/products', authenticate, (req, res, next) => {
  try {
    const { category, page = 1, limit = 5 } = req.query;
    let filteredProducts = products;

    if (category) {
      filteredProducts = products.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limitNum);

    res.json({
      totalProducts: filteredProducts.length,
      currentPage: pageNum,
      totalPages: Math.ceil(filteredProducts.length / limitNum),
      products: paginatedProducts
    });
  } catch (err) {
    next(err);
  }
});

// ✅ SEARCH products by name
app.get('/api/products/search', authenticate, (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) return next(new ValidationError('Search term (name) is required'));

    const results = products.filter(p =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    if (results.length === 0) throw new NotFoundError('No products found');
    res.json({ count: results.length, results });
  } catch (err) {
    next(err);
  }
});

// ✅ GET product by ID
app.get('/api/products/:id', authenticate, (req, res, next) => {
  const product = products.find(p => String(p.id) === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  res.json(product);
});

// ✅ POST create new product
app.post('/api/products', authenticate, validateProduct, (req, res, next) => {
  try {
    const newProduct = { id: uuidv4(), ...req.body };
    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

// ✅ PUT update product
app.put('/api/products/:id', authenticate, validateProduct, (req, res, next) => {
  const index = products.findIndex(p => String(p.id) === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));

  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

// ✅ DELETE product
app.delete('/api/products/:id', authenticate, (req, res, next) => {
  const index = products.findIndex(p => String(p.id) === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));

  const deleted = products.splice(index, 1);
  res.json({ message: 'Product deleted successfully', deleted });
});

// ✅ Product statistics route
app.get('/api/products/stats', authenticate, (req, res, next) => {
  try {
    const stats = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});
    res.json({ totalProducts: products.length, countByCategory: stats });
  } catch (err) {
    next(err);
  }
});

// ===============================
// 🧯 Global Error Handling Middleware
// ===============================
app.use((err, req, res, next) => {
  console.error("🔥 Error caught:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      name: err.name,
      message: err.message || "Internal Server Error",
    },
  });
});

// ===============================
// 7️⃣ Server Listener
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
=======
// TODO: Implement the following routes:
// GET /api/products - Get all products
// GET /api/products/:id - Get a specific product
// POST /api/products - Create a new product
// PUT /api/products/:id - Update a product
// DELETE /api/products/:id - Delete a product

// Example route implementation for GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app; 
>>>>>>> 1a4e41a301c983ea6d867f1abbb13e1ae2efbbed
