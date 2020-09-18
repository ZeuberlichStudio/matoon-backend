"use strict";

var _mongoose = require("mongoose");

var productSchema = new _mongoose.Schema({
  name: String,
  sku: String,
  desc: String,
  price: Number,
  variants: [{
    name: String,
    attr: {
      color: {
        type: _mongoose.SchemaTypes.ObjectId,
        ref: 'Color'
      },
      brand: {
        type: _mongoose.SchemaTypes.ObjectId,
        ref: 'Brand'
      }
    }
  }],
  meta: {
    stock: Number,
    orders: Number,
    createdAt: Date,
    updatedAt: Date
  }
}, {
  timestamps: {
    createdAt: 'meta.createdAt',
    updatedAt: 'meta.updatedAt'
  }
});
var Product = (0, _mongoose.model)('Product', productSchema);
module.exports = Product;