'use strict';

angular.module('app')
  .component('productListItem', {
    templateUrl: 'templates/shop/productlistitem.html',
    bindings: {
      'product': '<'
    }
  });
