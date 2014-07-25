'use strict';

/* Controllers */

var tribeApp = angular.module('tribeApp', [], function ($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function (obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
        alert(query);
        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});


tribeApp.controller('CardCtrl', ['$scope', '$http', 'authenticationService',
    function ($scope, $http, authenticationService) {
        $scope.orderProp = 'score';
        $scope.username = '';


        //if logged in
        if((localStorage.getItem("username") !== null) && (localStorage.getItem("id_token") !== null)){

            $scope.username = localStorage.getItem("username");
            var id_token = localStorage.getItem("id_token");
            console.log("logged in using "+$scope.username);

            $http({
                url: 'http://ec2-54-82-196-199.compute-1.amazonaws.com/php_includes/stream_generator_api.php',
                method: "GET",
                params: { id_token: id_token, username: $scope.username, app_filter_array: '', stream_media_type: 'mixed', current_id_list: '', scope: 'tribe', infinite: 'no', splode_status: 'mixed', trigger: 'fresh_load', page_owner: ''}
            })
                .success(function (data) {
                    $scope.cards = data;
                    console.log(data);

                    //test for article text
                    $http({
                        url: 'http://ec2-54-82-196-199.compute-1.amazonaws.com/php_parsers/get_article_content_api.php',
                        method: "GET",
                        params: {
                            article_id: "TueJun1716473420146048"
                        }
                    })
                        .success(function(data){
                            console.log(data);
                        })

                    setTimeout(function () {
                        startup();
                    });
                    //I don't know why setTimeout makes it work since I'm not even giving it a time but it does -- needs further testing
                })
        }

        //if not logged in
        else{
            console.log("not logged in, loading test data");
        $http.get('test_data.json')
            .success(function (data) {
                console.log(data);
                $scope.cards = data;
                setTimeout(function () {
                    startup();
                });
                //I don't know why setTimeout makes it work since I'm not even giving it a time but it does -- needs further testing
            })
        }

        //on login
        $scope.$on('logIn_success', function () {
            $scope.username = localStorage.getItem("username");
            var id_token = localStorage.getItem("id_token");
            console.log("logged in using "+$scope.username);

            $http({
                url: 'http://ec2-54-82-196-199.compute-1.amazonaws.com/php_includes/stream_generator_api.php',
                method: "GET",
                params: { id_token: authenticationService.id_token, username: authenticationService.username, app_filter_array: '', stream_media_type: 'mixed', current_id_list: '', scope: 'tribe', infinite: 'no', splode_status: 'mixed', trigger: 'fresh_load', page_owner: ''}
            })
                .success(function (data) {
                    $scope.cards = data;
                    console.log(data);
                    setTimeout(function () {
                        startup();
                    });
                    //I don't know why this makes it work since I'm not even giving it a time but it does -- needs further testing
                })
        });

        $scope.$on('logOut', function(){
            $scope.username = null;
        })
    }]);

function loginController($scope, $http, authenticationService) {
    $scope.formData = {};
    $scope.submit = function () {
        console.log($scope.formData);
        //authentication http://ec2-54-82-196-199.compute-1.amazonaws.com/app_parsers/user_authentication.php
        //{e:'firehose123',p:'firehose123'}

        $http({
            url: 'http://ec2-54-82-196-199.compute-1.amazonaws.com/app_parsers/user_authentication.php',
            method: "GET",
            params: {e: $scope.formData.name, p: $scope.formData.password}
        })
            .success(function (data) {
                console.log(data);
                if (data.error = "no_error") {
                    authenticationService.logIn_broadcast(data.username, data.id_token);
                    //store to local storage - claims to be phonegap compatibile
                    //set username and token
                    window.localStorage.setItem("username", data.username);
                    window.localStorage.setItem("id_token", data.id_token);
                    toggle_search(-1);
                }
            });
    }
}

function signupController($scope, $http, authenticationService) {
    $scope.formData = {};
    $scope.submit = function () {
        console.log($scope.formData);

        //authentication http://ec2-54-82-196-199.compute-1.amazonaws.com/app_parsers/user_authentication.php
        //{e:'firehose123',p:'firehose123'}
        $http.get('http://ec2-54-82-196-199.compute-1.amazonaws.com/app_parsers/user_authentication.php', {e: $scope.formData.name, p: $scope.formData.password})
            .success(function (data) {
                alert(data);
            });
    }
}

function logoutController($scope, authenticationService){
    $scope.submit = function(){
        localStorage.removeItem('username');
        localStorage.removeItem('id_token');
        authenticationService.logOut_broadcast();
    }
}

//CardCtrl.$inject = ['$scope', '$http', 'authenticationService'];
loginController.$inject = ['$scope', '$http', 'authenticationService'];
signupController.$inject = ['$scope', '$http', 'authenticationService'];


tribeApp.factory('authenticationService', function ($rootScope) {
    var sharedService = {};

    sharedService.message = '';

    sharedService.logIn_broadcast = function (username, id_token) {
        this.username = username;
        this.id_token = id_token;
        $rootScope.$broadcast('logIn_success');
    }

    sharedService.logOut_broadcast = function(){
        this.username = null;
        this.id_token = null;
        $rootScope.$broadcast("logOut");
    }

    return sharedService;
});

