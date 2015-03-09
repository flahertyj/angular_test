'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.version'
])

.factory('CityHelper', ['$http', '$q', function($http, $q) {
  var service = {};

  service.cityList = function() {
    var deferred = $q.defer();
    $http.get('http://mqlocal.aol.com/photos')
      .success(function(data) {
        for (var i = 0; i < data.length; i++) {
          var description = data[i].description
          if (typeof description !== 'undefined') {
            var descArray = description.split(' ')
            data[i].name = descArray[descArray.length - 1]// Adding name since description has the id as well so this is simpler.
          }
        }

        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        deferred.resolve(data);
      });

    return deferred.promise;
  };

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
        deferred.resolve(-1);
      });

      return deferred.promise;
  };

  service.cityDetails = function(cityName) {
    var deferred = $q.defer();

    this.nameToId(cityName)
      .then(function(cityId){
        $http.get('http://mqlocal.aol.com/photos/' + cityId).
          success(function(data) {
            deferred.resolve(data);
          }).
          error(function(data, status, headers, config) {
            deferred.resolve(data);
          });
      }, function(data) {
        deferred.resolve(data);
      })

    return deferred.promise;
  };

  return service;
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/cities.html',
      controller: 'CityController',
      resolve: {
        cityList: ['CityHelper', function(CityHelper) {
          return CityHelper.cityList();
        }]
      }
    }).
    when('/:cityName', {
      templateUrl: 'partials/cityDetails.html',
      controller: 'CityDetailController',
      resolve: {
        cityDetails: ['CityHelper', '$location', function(CityHelper, $location) {
          // Couldn't figure out how to just get the city name without '/', I'm sure there's an easier way...
          return CityHelper.cityDetails($location.path().replace('/', ''));
        }]
      }
    }).
    otherwise({
      redirectTo: '/'
    });
}])

.controller('CityController', ['$scope', 'cityList', function($scope, cityList) {
  $scope.cityList = cityList;
}])

.controller('CityDetailController', ['$scope', 'cityDetails', function($scope, cityDetails) {
  $scope.cityDetails = cityDetails;
}]);
