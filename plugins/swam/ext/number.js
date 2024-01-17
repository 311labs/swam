
Number.prototype.isNumber = function() {
    return true;
};

Number.prototype.isFloat = function() {
    return this % 1 !== 0;
};

Number.prototype.toInt = function() {
    return this.valueOf();
};

Number.prototype.toCurrency = function() {
    return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
};

Number.randomFloat = function(min, max) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 10;
    return Math.random() * (+max - +min) + +min;
};

Number.randomInt = function(min, max) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 10;
    return Math.floor(Math.random() * (+max - +min)) + +min;
};

Number.prototype.toCents = function() {
    return parseInt(Math.round(this*100));
};

String.prototype.toCents = function() {
    let val = this;
    if (val == '') val = 0;
    return parseInt(Math.round(parseFloat(val)*100));
};


var __FS_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
var __FS_STEP = 1024;

function __fs_format(value, power) {
    return (value / Math.pow(__FS_STEP, power)).toFixed(2) + " " + __FS_UNITS[power];
}

Number.prototype.toFileSize = function() {
    value = parseFloat(this, 10);
    for (var i = 0; i < __FS_UNITS.length; i++) {
        if (value < Math.pow(__FS_STEP, i)) {
            if (__FS_UNITS[i - 1]) {
                return __fs_format(value, i - 1);
            }
            return value + " " + __FS_UNITS[i];
        }
    }
    return __fs_format(value, i - 1);
}

Number.prototype.fileSizeToBytes = function() {
    return this;
}

String.prototype.fileSizeToBytes = function() {
    if (this.isNumber()) return this;
    let unit = this.slice(-2).toUpperCase();
    let value = this.slice(0,-2);
    let index = __FS_UNITS.indexOf(unit);
    if (index === -1) {
        throw new Error('Invalid unit');
    }
    return value * Math.pow(__FS_STEP, index);
};

