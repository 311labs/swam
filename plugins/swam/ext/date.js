/**
 * Simple Date extension to allow for add/subtracting months, days, hours, minutes, seconds
 * from a JS Date object
 * 
 * var now = new Date();
 * var future = now.plus({days:3, minutes:20});
 * var past = now.minus({days:3, minutes:20});
 */

Date.DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

Date.prototype.plus = function(delta) {
  return this.transform(delta);
};

Date.prototype.minus = function(delta) {
  _.each(delta, function(value, key){
    delta[key] = value * - 1;
  });
  return this.transform(delta);
};

Date.prototype.transform = function(delta) {
  delta = _.extend({months: 0, days:0, hours: 0, minutes: 0, seconds: 0}, delta);
  var result = new Date(this.valueOf());
  if (delta.days) {
    result.setDate(result.getDate() + delta.days);
  }
  if (delta.months) {
    result.setMonth(result.getMonth() + delta.months);
  }
  if (delta.hours || delta.minutes || delta.seconds) {
    var ms = 0;
    ms += (delta.hours * 60 * 60 * 1000);
    ms += (delta.minutes * 60 * 1000);
    ms += (delta.seconds * 1000);
    result.setTime(result.getTime() + ms);
  }
  
  return result;
};

