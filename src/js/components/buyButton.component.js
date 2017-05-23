'use strict';

angular.module('app')
  .component('buyButton', {
    templateUrl: 'templates/shop/buybutton.html',
    bindings: {
      'product' : '<'
    }
  });
