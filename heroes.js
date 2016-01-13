(function(angular) {
  'use strict';
  var heroes = angular.module('heroes', []);


  heroes.factory('RequestFactory', ['$http',function($http){
    var athenaAPI = 'https://athena-7.herokuapp.com/ancients.json',
        query = "",
        url = "",
        searching = true,
        cache = {};

    var checkCache = function(callback, query){
      if (cache[query]) {
        callback( cache[query] );
        return true;
      } else {
        return false;
      }
    }
    
    var sendRequest = function(callback, query, error){
      if (error) {
        //handle an error
        query = "?error=true"
        searching = false;
      } else if (query) {
        //format the search query
        query = "?search="+query;
        //check to see if cache contains data for this query
        //if so, don't proceed with get request
        if ( checkCache(callback,query) ) return;
        searching = true;
      } else {
        query = "";
        searching = false;
      }

      url = athenaAPI+query;
      $http.get(url).then(function(response) {
        var heroes = searching ? response.data.ancients : response.data;

        //add response to cache for next time it's called
        cache[query] = {heroes:heroes, cache:new Date()};
        callback({heroes:heroes});
        return ;

      },function(response){
        callback({error: response.data.error})
        return ;
      });
    };

    return {
      sendRequest:sendRequest
    };
  }]);

  heroes.controller('HeroController', ['$scope','RequestFactory', function($scope,RequestFactory) {
    $scope.heroes = [];
    $scope.search = "";
    $scope.error = "";

    var searchCallback = function(result){
      console.log(result);
      if (result.error) {
        $scope.error = result.error;
        $scope.heroes = {};
      } else {
        $scope.heroes = result.heroes;
        $scope.cacheMessage = result.cache?"This result was cached on "+result.cache:"";
        $scope.error = "";
      }
      //$scope.$apply();
    }

    $scope.refresh = function() {
      var searchString = "";
      //ensure the search string matches the requirements of the API
      if ($scope.search) searchString = $scope.search[0].toUpperCase() + $scope.search.substring(1).toLowerCase();
      RequestFactory.sendRequest(searchCallback,searchString);
      return ;
    };

    $scope.requestError = function() {
      var error = true;
      RequestFactory.sendRequest(searchCallback,$scope.search,error);
      return ;
    }

    //invoke own
    $scope.refresh();

  }]);
})(window.angular);