"use strict";

var _mongoose = require("mongoose");

var colorSchema = new _mongoose.Schema({
  name: String,
  value: String
});
var Color = (0, _mongoose.model)('Color', colorSchema);
module.exports = Color;