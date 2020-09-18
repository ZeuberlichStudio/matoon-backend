"use strict";

var _mongoose = require("mongoose");

var brandSchema = new _mongoose.Schema({
  name: String,
  value: String
});
var Brand = (0, _mongoose.model)('Brand', brandSchema);
module.exports = Brand;