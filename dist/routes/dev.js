"use strict";

var _color = _interopRequireDefault(require("../database/models/color"));

var _brand = _interopRequireDefault(require("../database/models/brand"));

var _product = _interopRequireDefault(require("../database/models/product"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var router = require('express').Router(); //Color endpoints


router.get('/colors', function (req, res) {
  _color["default"].find().then(function (data) {
    return res.send(data);
  })["catch"](function (err) {
    return res.send(err);
  });
});
router.post('/colors/create', function (req, res) {
  _color["default"].create(req.body).then(function (data) {
    return res.send(data);
  })["catch"](function (err) {
    return res.send(err);
  });
}); //Brand endpoints

router.get('/brands', function (req, res) {
  _brand["default"].find().then(function (data) {
    return res.send(data);
  })["catch"](function (err) {
    return res.send(err);
  });
});
router.post('/brands/create', function (req, res) {
  _brand["default"].create(req.body).then(function (data) {
    return res.send(data);
  })["catch"](function (err) {
    return res.send(err);
  });
}); //Product endpoints

router.post('/products/create', function (req, res) {
  _product["default"].create(req.body).then(function (data) {
    return res.send(data);
  })["catch"](function (err) {
    return res.send(err);
  });
});
router.post('/products/update', function (req, res) {
  var ids = req.body.map(function (_ref) {
    var _id = _ref._id;
    return _id;
  });

  var _iterator = _createForOfIteratorHelper(ids.entries()),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
          i = _step$value[0],
          id = _step$value[1];

      _product["default"].findOneAndUpdate({
        id: id
      }, _objectSpread({}, req.body[i]), {
        useFindAndModify: false
      }, function (err) {
        if (err) res.send(err);
      });
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  ;
});
router.post('/products/remove', function (req, res) {
  var call = req.query.many === "many" ? _product["default"].deleteMany(req.body) : _product["default"].deleteOne(req.body);
  call.then(function (data) {
    return res.send(data);
  })["catch"](function (err) {
    return res.send(err);
  });
}); //Filters endpoints

router.get('/filters', function (req, res) {
  var filterIds = _product["default"].aggregate([{
    $unwind: '$variants'
  }, {
    $unwind: '$variants.attr'
  }, {
    $group: {
      _id: 0,
      colors: {
        $addToSet: '$variants.attr.color'
      },
      brands: {
        $addToSet: '$variants.attr.brand'
      }
    }
  }, {
    $lookup: {
      from: _color["default"].collection.name,
      localField: 'colors',
      foreignField: '_id',
      as: 'colors'
    }
  }, {
    $lookup: {
      from: _brand["default"].collection.name,
      localField: 'brands',
      foreignField: '_id',
      as: 'brands'
    }
  }, {
    $project: {
      "_id": 0
    }
  }]);

  _color["default"].populate(filterIds, {
    path: 'colors'
  }).then(function (data) {
    return res.send(data);
  })["catch"](function (err) {
    return res.send(err);
  });
});
module.exports = router;