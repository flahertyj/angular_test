'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.version'
])

.factory('CityHelper', ['$http', '$q', function($http, $q) {
  var service = {};

  service.nameToId = function(name) {
    var deferred = $q.defer();
    $http.get('http://mqlocal.aol.com/photos').
      success(function(data) {
        for (var i = 0; i < data.length; i++) {
          var description = data[i].description;
          if (typeof description !== 'undefined') {
            var descArray = description.split(' ');
            var cityName = descArray[descArray.length - 1];// Adding name since description has the id as well so this is simpler.
            if (cityName.toLowerCase() === name.toLowerCase()) {
              deferred.resolve(descArray[0]);
            }
          }
        }

        deferred.resolve(-1);
      }).
      error(function(data, status, headers, config) {
        console.log("ERROR @")
        deferred.resolve(-1);
      });

      return deferred.promise;
  };

  return service;
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/cities.html',
      controller: 'CityController'
    }).
    when('/:cityName', {
      templateUrl: 'partials/cityDetails.html',
      controller: 'CityDetailController'
    }).
    otherwise({
      redirectTo: '/'
    });
}])

.controller('CityController', ['$scope', '$http', function($scope, $http) {
  $http.get('http://mqlocal.aol.com/photos')
    .success(function(data) {
      for (var i = 0; i < data.length; i++) {
        var description = data[i].description
        if (typeof description !== 'undefined') {
          var descArray = description.split(' ')
          data[i].name = descArray[descArray.length - 1]// Adding name since description has the id as well so this is simpler.
        }
      }

      $scope.cityList = data;
    })
    .error(function(data, status, headers, config) {
      console.log(data);
    });
}])

.controller('CityDetailController', ['$scope', '$routeParams', '$http', 'CityHelper',
function($scope, $routeParams, $http, CityHelper) {
  var cityName = $routeParams.cityName;

  CityHelper.nameToId(cityName)
    .then(function(cityId){
      $http.get('http://mqlocal.aol.com/photos/' + cityId).
        success(function(data) {
          $scope.cityDetails = data;
        }).
        error(function(data, status, headers, config) {
          console.log(data);
        });
    }, function(data) {
      console.log(data);
    })
}]);
