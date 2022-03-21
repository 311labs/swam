

/**
 * Inserts an item into the array at the given position.
 * @param vItem The item to insert.
 * @param iIndex The index to insert the item into.
 */
Array.prototype.insertAt = function (vItem /*:variant*/, iIndex /*:int*/) /*:variant*/ {
    this.splice(iIndex, 0, vItem);
};


Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    if ((L == 1) && (_.isArray(a[0]))) {
        count = this.removeList(a[0]);
    } else {
        count = this.removeList(a);
    }
    return this;
};

Array.prototype.removeList = function(lst) {
    var what, a = lst,
        L = a.length,
        ax;
    var count = 0;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            count += 1;
            this.splice(ax, 1);
        }
    }
    return count;
};

Array.prototype.has = function() {
    if ((arguments.length == 1) && (_.isArray(arguments[0]))) {
        var lst = arguments[0];
        var i = lst.length;
        var c = 0;
        while (i--) {
            var item = lst[i];
            if (this.indexOf(item) >= 0) c += 1;
        }
        return c;
    } else if (arguments.length > 0) {
        return this.has(Array.from(arguments).sort(function (a, b) { return a - b; }));
    }
    return false;
};

Array.prototype.hasAll = function() {
    if ((arguments.length == 1) && (_.isArray(arguments[0]))) {
        var lst = arguments[0];
        var i = lst.length;
        var r = true;
        while (i--) {
            var item = lst[i];
            if (this.indexOf(item) < 0) r = false;
        }
        return r;
    } else if (arguments.length > 0) {
        return this.has(Array.from(arguments).sort(function (a, b) { return a - b; }));
    }
    return false;
};


Array.prototype.average = function () {
    return this.reduce(function(memo, num) { return memo + num; }, 0) / this.length || 1 ;
};


Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}


if (!Array.prototype.fill) {
  Object.defineProperty(Array.prototype, 'fill', {
    value: function(value) {

      // Steps 1-2.
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);

      // Steps 3-5.
      var len = O.length >>> 0;

      // Steps 6-7.
      var start = arguments[1];
      var relativeStart = start >> 0;

      // Step 8.
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;

      // Step 11.
      var finalValue = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

      // Step 12.
      while (k < finalValue) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    }
  });
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: https://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback/*, thisArg*/) {

    var T, A, k;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this|
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: https://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = arguments[1];
    }

    // 6. Let A be a new array created as if by the expression new Array(len)
    //    where Array is the standard built-in constructor with that name and
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal
        //     method of callback with T as the this value and argument
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}


