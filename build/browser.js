(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toArray(arr) {
    return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var CharStream =
  /*#__PURE__*/
  function () {
    function CharStream(data, cursor, row, column) {
      _classCallCheck(this, CharStream);

      this.data = data;
      this.cursor = cursor;
      this.row = row;
      this.column = column;
      Object.freeze(this);
    }

    _createClass(CharStream, [{
      key: "advance",
      value: function advance() {
        var char = this.data[this.cursor];
        var newStream = char === '\n' ? new CharStream(this.data, this.cursor + 1, this.row + 1, 1) : new CharStream(this.data, this.cursor + 1, this.row, this.column + 1);
        return {
          char: char,
          stream: newStream
        };
      }
    }], [{
      key: "FromString",
      value: function FromString(string) {
        return new CharStream(string, 0, 1, 1);
      }
    }]);

    return CharStream;
  }();

  var Result =
  /*#__PURE__*/
  function () {
    function Result(stream) {
      _classCallCheck(this, Result);

      this.stream = stream;
    }

    _createClass(Result, [{
      key: "map",
      value: function map(_) {
        throw undefined;
      }
    }, {
      key: "bind",
      value: function bind(_) {
        throw undefined;
      }
    }]);

    return Result;
  }();
  var Success =
  /*#__PURE__*/
  function (_Result) {
    _inherits(Success, _Result);

    function Success(value, stream) {
      var _this;

      _classCallCheck(this, Success);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Success).call(this, stream));
      _this.value = value;
      Object.freeze(_assertThisInitialized(_this));
      return _this;
    }

    _createClass(Success, [{
      key: "map",
      value: function map(f) {
        var _f = f(this.value, this.stream),
            _f2 = _slicedToArray(_f, 2),
            value = _f2[0],
            stream = _f2[1];

        return new Success(value, stream);
      }
    }, {
      key: "bind",
      value: function bind(f) {
        return f(this.value, this.stream);
      }
    }]);

    return Success;
  }(Result);
  var Failure =
  /*#__PURE__*/
  function (_Result2) {
    _inherits(Failure, _Result2);

    function Failure(message, stream) {
      var _this2;

      _classCallCheck(this, Failure);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Failure).call(this, stream));
      _this2.message = message;
      Object.freeze(_assertThisInitialized(_this2));
      return _this2;
    }

    _createClass(Failure, [{
      key: "map",
      value: function map(_) {
        return this;
      }
    }, {
      key: "bind",
      value: function bind(_) {
        return this;
      }
    }]);

    return Failure;
  }(Result);

  var position = function position(stream) {
    return new Success([stream.row, stream.column], stream);
  };

  var lazy = function lazy(f) {
    return function (stream) {
      return f()(stream);
    };
  };

  var return_ = function return_(x) {
    return function (stream) {
      return new Success(x, stream);
    };
  };

  var fail = function fail(message) {
    return function (stream) {
      return new Failure(message, stream);
    };
  };

  var bind = function bind(parser) {
    return function (f) {
      return function (stream) {
        return parser(stream).bind(function (value, stream) {
          return f(value)(stream);
        });
      };
    };
  };

  var map = function map(parser) {
    return function (f) {
      return bind(parser)(function (x) {
        return return_(f(x));
      });
    };
  };

  var optional = function optional(parser) {
    return function (stream) {
      var result = parser(stream);

      if (result instanceof Failure) {
        return new Success(undefined, stream);
      } else {
        return result;
      }
    };
  };

  var string = function string(str) {
    return function (stream) {
      var str_ = function str_(_ref) {
        var _ref2 = _toArray(_ref),
            head = _ref2[0],
            tail = _ref2.slice(1);

        return bind(any)(function (c) {
          return function (stream_) {
            return c === head ? tail.length === 0 ? return_(str)(stream_) : str_(tail)(stream_) : fail("Got '" + c + "' expected '" + head + "'")(stream);
          };
        });
      };

      return str_(str)(stream);
    };
  };

  var withDefault = function withDefault(x) {
    return function (parser) {
      return map(optional(parser))(function (option) {
        return option ? option : x;
      });
    };
  };

  var pipe = function pipe(_ref3) {
    var _ref4 = _toArray(_ref3),
        head = _ref4[0],
        tail = _ref4.slice(1);

    return head === undefined ? return_([]) : bind(head)(function (h) {
      return map(pipe(tail))(function (t) {
        return [h].concat(t);
      });
    });
  };

  var ignore = function ignore(_ref5) {
    var _ref6 = _toArray(_ref5),
        head = _ref6[0],
        tail = _ref6.slice(1);

    return head === undefined ? return_(undefined) : bind(head)(function (_) {
      return ignore(tail);
    });
  };

  var do_ = function do_(_ref7) {
    var _ref7$first = _ref7.first,
        first = _ref7$first === void 0 ? [] : _ref7$first,
        apply = _ref7.apply,
        _ref7$then = _ref7.then,
        then = _ref7$then === void 0 ? [] : _ref7$then;
    return bind(ignore(first))(function (_) {
      return bind(apply)(function (value) {
        return map(ignore(then))(function (_) {
          return value;
        });
      });
    });
  };

  var any = function any(stream) {
    var _stream$advance = stream.advance(),
        char = _stream$advance.char,
        stream1 = _stream$advance.stream;

    return char ? new Success(char, stream1) : new Failure("End of file.", stream1);
  };

  var eof = function eof(stream) {
    var result = any(stream);

    if (result instanceof Failure) {
      return new Success(undefined, stream);
    } else {
      return new Failure("Expected eof, got: " + result.value, stream);
    }
  };

  var char = function char(predicate) {
    return bind(any)(function (x) {
      return predicate(x) ? return_(x) : fail(x + "does not match predicate.");
    });
  };

  var many = function many(parser) {
    return function (stream) {
      return bind(optional(parser))(function (head) {
        return function (stream_) {
          return head === undefined ? return_([])(stream_) : stream === stream_ ? fail("infinite loop detected.")(stream) : map(many(parser))(function (tail) {
            return [].concat([head], tail);
          })(stream_);
        };
      })(stream);
    };
  };

  var many1 = function many1(parser) {
    return bind(parser)(function (head) {
      return map(many(parser))(function (tail) {
        return [head].concat(tail);
      });
    });
  };

  var manySepEndBy = function manySepEndBy(parser) {
    return function (separator) {
      return function (stream) {
        return bind(optional(parser))(function (head) {
          return function (stream_) {
            return head === undefined ? return_([])(stream_) : stream === stream_ ? fail("infinite loop detected.")(stream) : bind(optional(separator))(function (sep) {
              return sep === undefined ? return_([head]) : map(manySepEndBy(parser)(separator))(function (tail) {
                return [].concat([head], tail);
              });
            })(stream_);
          };
        })(stream);
      };
    };
  };

  var many1SepEndBy = function many1SepEndBy(parser) {
    return function (separator) {
      return bind(parser)(function (head) {
        return bind(optional(separator))(function (sep) {
          return sep === undefined ? return_([head]) : map(manySepEndBy(parser)(separator))(function (tail) {
            return [].concat([head], tail);
          });
        });
      });
    };
  };

  var many1SepBy = function many1SepBy(parser) {
    return function (separator) {
      return function (stream) {
        return bind(parser)(function (head) {
          return function (stream_) {
            return head === undefined ? return_([])(stream_) : stream === stream_ ? fail("infinite loop detected.")(stream) : bind(optional(separator))(function (sep) {
              return sep === undefined ? return_([head]) : map(many1SepBy(parser)(separator))(function (tail) {
                return [].concat([head], tail);
              });
            })(stream_);
          };
        })(stream);
      };
    };
  };

  var manySepBy = function manySepBy(parser) {
    return function (separator) {
      return bind(optional(parser))(function (head) {
        return head === undefined ? return_([]) : bind(optional(separator))(function (sep) {
          return sep === undefined ? return_([head]) : map(many1SepBy(parser)(separator))(function (tail) {
            return [].concat([head], tail);
          });
        });
      });
    };
  };

  var integer = map(many1(char(function (c) {
    return c >= '0' && c <= '9';
  })))(function (chars) {
    return +chars.join("");
  });

  var choice = function choice(parsers) {
    return function (stream) {
      function choice_(p, e, stream) {
        if (p.length === 0) {
          return new Failure("Failed to parse choices: \n" + e.join("\n\t"));
        } else {
          var _p = _toArray(p),
              parser = _p[0],
              tail = _p.slice(1);

          var result = parser(stream);

          if (result instanceof Success) {
            return result;
          } else {
            return choice_(tail, e.concat([result.message]), stream);
          }
        }
      }

      return choice_(parsers, [], stream);
    };
  };

  var Parser = {
    return: return_,
    fail: fail,
    bind: bind,
    map: map,
    optional: optional,
    withDefault: withDefault,
    position: position,
    char: char,
    string: string,
    any: any,
    eof: eof,
    lazy: lazy,
    many: many,
    many1: many1,
    manySepEndBy: manySepEndBy,
    many1SepEndBy: many1SepEndBy,
    manySepBy: manySepBy,
    many1SepBy: many1SepBy,
    integer: integer,
    pipe: pipe,
    choice: choice,
    do: do_
  };

  function test() {
    var parser = Parser.string("H");
    var result = parser(CharStream.FromString("H"));
  }

  test();

}));
//# sourceMappingURL=browser.js.map
