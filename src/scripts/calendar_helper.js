define([], function(){
  "use strict";

  Element.prototype.deleteAllChildNodes = function() {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
        return this;
    };
});