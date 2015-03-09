'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.version'
])

.service('CityHelper', ['$http', function($http) {
  this.nameToId = function(name) {
    $http.get('http://mqlocal.aol.com/photos').
      success(function(data) {
        for (var i = 0; i < data.length; i++) {
          var description = data[i].description
          if (description) {
            var descArray = description.split(' ');
            var cityName = descArray[descArray.length - 1];// Adding name since description has the id as well so this is simpler.
            if (cityName.toLowerCase() === name.toLowerCase()) {
              return descArray;
            }
          }
        }

        return -1;
      }).
      error(function(data, status, headers, config) {
        return -1;
      });
  };
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/city/:cityId', {
      templateUrl: 'partials/cityDetails.html',
      controller: 'CityDetailController'
    }).
    otherwise({
      redirectTo: '/'
    });
}])

.controller('CityController', ['$scope', '$http', function($scope, $http) {
  $http.get('http://mqlocal.aol.com/photos').
    success(function(data) {
      for (var i = 0; i < data.length; i++) {
        var description = data[i].description
        if (description) {
          var descArray = description.split(' ')
          data[i].name = descArray[descArray.length - 1]// Adding name since description has the id as well so this is simpler.
        }
      }

      $scope.cityList = data;
    }).
    error(function(data, status, headers, config) {
      $scope.cityList = [];
    });
}])

.controller('CityDetailController', ['$scope', '$routeParams', '$http', 'CityHelper', function($scope, $routeParams, $http, CityHelper) {
  var cityId = $routeParams.cityId;

  if (isNaN(cityId)) {// If cityId route param is not a number, find it by name.
    $http.get('http://mqlocal.aol.com/photos').
      success(function(data) {
        for (var i = 0; i < data.length; i++) {
          var description = data[i].description
          if (description) {
            var descArray = description.split(' ');
            var cityName = descArray[descArray.length - 1];// Adding name since description has the id as well so this is simpler.
            if (cityName.toLowerCase() === cityId.toLowerCase()) {
              $scope.cityId = descArray[0];
              $http.get('http://mqlocal.aol.com/photos/' + $scope.cityId).
                success(function(data) {
                  $scope.cityDetails = data;
                }).
                error(function(data, status, headers, config) {
                  $scope.cityDetails = [];
                });
            }
          }
        }

        $scope.cityDetails = [];
      }).
      error(function(data, status, headers, config) {
        $scope.cityDetails = [];
      });
  }else {
    $scope.cityId = cityId;
    $http.get('http://mqlocal.aol.com/photos/' + $scope.cityId).
      success(function(data) {
        $scope.cityDetails = data;
      }).
      error(function(data, status, headers, config) {
        $scope.cityDetails = [];
      });
  }
}]);
