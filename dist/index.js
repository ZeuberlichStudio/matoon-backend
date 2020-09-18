"use strict";

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _connection = _interopRequireDefault(require("./database/connection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require('dotenv').config();

var app = (0, _express["default"])();
app.use(_bodyParser["default"].json());
app.use('/products', require('./routes/products'));
app.use('/dev', require('./routes/dev'));
var port = process.env.PORT || 3001;
var server = app.listen(port, function () {
  return console.log("app is running on port ".concat(server.address().port));
});