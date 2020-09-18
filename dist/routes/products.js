"use strict";

var _product = _interopRequireDefault(require("../database/models/product"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var router = require('express').Router();

router.get('/', function (req, res) {
  var where = req.query.name && {
    name: req.query.name.slice(",")
  };

  var sort = req.query.sort && _defineProperty({}, req.query.sort.split(",")[0], req.query.sort.split(",")[1]);

  _product["default"].find(where && where).sort(sort && sort).then(function (data) {
    return res.send(data);
  })["catch"](function (err) {
    return res.send(err);
  });
});
module.exports = router;