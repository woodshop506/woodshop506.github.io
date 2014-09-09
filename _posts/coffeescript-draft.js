var Child, Base, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function (child, parent) {
    // Copy the properties from parent to child
    for (var key in parent) {
        if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
      
    function ctor() {
        this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
  };

Base = (function() {
  function Base() {
    this.shitter = 'tits';
  }

  Base.prototype.a = function() {
    return console.log;
  };

  return Base;

})();

Child = (function(_super) {
  __extends(Child, _super);

  function Child() {
    _ref = Child.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return Child;

})(Base);
