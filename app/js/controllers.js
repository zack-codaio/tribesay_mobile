'use strict';

/* Config */
var local = false;
var dev = true;

/* Endpoint URLs */
if (dev == true) {
//http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/stream_generator_api.php?id_token=40348382&username=firehouse&article_id=TueJun1716473420146048&stream_media_type=mixed&scope=tribe&infinite=no&splode_status=mixed&trigger=fresh_load&current_id_list=&page_owner=&app_filter_array=tech,fire (note: for “personal content” set page_owner=username and scope=single)
    var stream_gen_url = "http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/stream_generator_api.php";

//http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/get_comments_api.php?id_token=40348382&username=firehouse&timing=initial&action=retrieve_comments&content_id=TueJun1717412020146235&parent_id=TueJun1717412020146235&level=0&sibling_id=1
    var get_comments_url = "http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/get_comments_api.php";

//http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/get_article_content_api.php?id_token=40348382&username=firehouse&article_id=TueJun1717412020146235
    var get_article_url = "http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/get_article_content_api.php";

//http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/user_authentication.php?e=testaccount&p=testaccount
    var authentication_url = "http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/user_authentication.php";

//http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/get_comments_api.php?action=comment_post&username=testaccount&id_token=46514957&data=thisistheendmothafuckashahaahah&parent_unique=TueJul1515110320148865&content_unique=TueJul1515110320148865&content_type=article&level=0 (note: to reply to another article, change the parent_unique and set level to that of parent.)
    var post_comment_url = "http://ec2-54-82-2-183.compute-1.amazonaws.com/app_parsers/endpoint/get_comments_api.php";
}

/* Controllers */

angular.module('tribeApp.controllers', ['ngTouch'])
    .controller('CardCtrl', ['$scope', '$http', 'authenticationService', '$location', 'cardService',
        function ($scope, $http, authenticationService, $location) {
//            $scope.orderProp = 'score';
            $scope.username = '';
            $scope.current_index = 0;
            var last_index;

            //things that need to be saved:
            //current_index, last_index, id_object, $scope.cards

            //array for
            //video, sound, article, count, comma separated
            var id_object = new Object();
            id_object.video = new Object();
            id_object.article = new Object();
            id_object.sound = new Object();
            id_object.video.count = 0;
            id_object.article.count = 0;
            id_object.sound.count = 0;
            id_object.video.id_list = "";
            id_object.article.id_list = "";
            id_object.sound.id_list = "";
            //function to update id_object (which holds the id's of currently loaded content) + append to model
            function tally_cards(data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].media == "video") {
                        id_object.video.count++;
                        id_object.video.id_list += data[i].unique_id + ",";
                    }
                    else if (data[i].media == "article") {
                        id_object.article.count++;
                        id_object.article.id_list += data[i].unique_id + ",";
                    }
                    else if (data[i].media == "sound") {
                        id_object.sound.count++;
                        id_object.sound.id_list += data[i].unique_id + ",";
                    }
                }
                console.log(id_object);
                console.log(current_id_list());
            }
            function current_id_list(){
                var the_list = "mixed_stream,";
                the_list += "article||"+id_object.article.count+"||count,";
                the_list += id_object.article.id_list;
                the_list += "sound||"+id_object.sound.count+"||count,";
                the_list += id_object.sound.id_list;
                the_list += "video||"+id_object.video.count+"||count,";
                the_list += id_object.video.id_list;
                return the_list;
            }


            //-1 to go back, 1 to go forward
            $scope.change_card = function (a) {
                if (a == 1) {
                    console.log($scope.current_index);
                    last_index = $scope.cards.length - 1;
                    console.log(last_index);
                    $scope.current_index += 1;
                    if (last_index - $scope.current_index <= 3) { //if 3 or fewer cards left, fetch more
                        //when getting data back, index the unique id's into id_array so it is easy to send back to the server


                        $scope.username = localStorage.getItem("username");
                        var id_token = localStorage.getItem("id_token");
                        console.log("logged in using " + $scope.username);

                        //make request for more cards
                        $http({
                            url: stream_gen_url,
                            method: "GET",
                            params: { id_token: id_token, username: $scope.username, app_filter_array: '', stream_media_type: 'mixed', current_id_list: current_id_list(), scope: 'tribe', infinite: 'no', splode_status: 'mixed', trigger: '', page_owner: ''}
                        })
                            .success(function (data) {
//                                $scope.cards = data;
                                console.log(data);
                                if (data.error == "Invalid Credentials") {
                                    $location.path('/login');
                                }

                                tally_cards(data);
                                for (var i = 0; i < data.length; i++) {
                                    $scope.cards.push(data[i]); //append data to $scope.cards
                                }

                                console.log($scope.cards);
                            })


                    }
                }
                else if (a == -1 && $scope.current_index > 0) {
                    $scope.current_index -= 1;
                }
            }


            //if logged in
            if ((localStorage.getItem("username") !== null) && (localStorage.getItem("id_token") !== null)) {

                $scope.username = localStorage.getItem("username");
                var id_token = localStorage.getItem("id_token");
                console.log("logged in using " + $scope.username);

                $http({
                    url: stream_gen_url,
                    method: "GET",
                    params: { id_token: id_token, username: $scope.username, app_filter_array: '', stream_media_type: 'mixed', current_id_list: '', scope: 'tribe', infinite: 'no', splode_status: 'mixed', trigger: 'fresh_load', page_owner: ''}
                })
                    .success(function (data) {
                        $scope.cards = data;
                        console.log(data);
                        if (data.error == "Invalid Credentials") {
                            $location.path('/login');
                        }

                        tally_cards(data);

                        setTimeout(function () {
//                            startup();
                        });
                        //I don't know why setTimeout makes it work since I'm not even giving it a time but it does -- needs further testing
                    })
            }

            //if not logged in
            else {
                if (!local) {
                    $location.path('/login');
                }
                else {
                    console.log("not logged in, loading test data");
                    $http.get('test_data.json')
                        .success(function (data) {
                            console.log(data);
                            $scope.cards = data;
                            setTimeout(function () {
//                                startup();
                            });
                            //I don't know why setTimeout makes it work since I'm not even giving it a time but it does -- needs further testing
                        })

                }
            }

            //on login
            $scope.$on('logIn_success', function () {
                $scope.username = localStorage.getItem("username");
                var id_token = localStorage.getItem("id_token");
                console.log("logged in using " + $scope.username);

                $http({
                    url: stream_gen_url,
                    method: "GET",
                    params: { id_token: authenticationService.id_token, username: authenticationService.username, app_filter_array: '', stream_media_type: 'mixed', current_id_list: '', scope: 'tribe', infinite: 'no', splode_status: 'mixed', trigger: 'fresh_load', page_owner: ''}
                })
                    .success(function (data) {
                        $scope.cards = data;
                        console.log(data);
//                        setTimeout(function () {
//                            startup(); //must be wrapped in setTimeout() -- probably a better (more angular) way to go about this
//                        });

                    })
                    .error(function (data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        console.log("error logging in");
                    });
            });

            $scope.$on('logOut', function () {
                $scope.username = null;
            })


        }]);


function loginController($scope, $http, authenticationService, $location) {
    $scope.formData = {};
    $scope.submit = function () {
        console.log($scope.formData);

        $http({
            url: authentication_url,
            method: "GET",
            params: {e: $scope.formData.name, p: $scope.formData.password}
        })
            .success(function (data) {
                console.log(data);
                if (data.error == "no_error") {
                    authenticationService.logIn_broadcast(data.username, data.id_token);
                    //store to local storage - claims to be phonegap compatibile
                    //set username and token
                    window.localStorage.setItem("username", data.username);
                    window.localStorage.setItem("id_token", data.id_token);
//                    toggle_search(-1);
                    $location.path('/cards');
                }
            });
    }

    $scope.account = 0;
    $scope.existing_account = function () {
        $scope.account = 1;
    }
    $scope.create_account = function () {
        $scope.account = 0;
    }
}

function signupController($scope, $http, authenticationService) {
    $scope.formData = {};
    $scope.submit = function () {
        console.log($scope.formData);

        //authentication http://ec2-54-82-196-199.compute-1.amazonaws.com/app_parsers/user_authentication.php
        //{e:'firehose123',p:'firehose123'}
        $http.get('http://ec2-54-82-196-199.compute-1.amazonaws.com/app_parsers/endpoint/user_authentication.php', {e: $scope.formData.name, p: $scope.formData.password})
            .success(function (data) {
                alert(data);
            });
    }
}

function logoutController($scope, authenticationService, $location) {
    $scope.submit = function () {
        localStorage.removeItem('username');
        localStorage.removeItem('id_token');
        authenticationService.logOut_broadcast();
        $location.path('/login');
    }
}

function articleController($scope, $location, $http, $routeParams, $sce) { //route params?
    var id = $routeParams.id;
    console.log(id);

    $scope.title;
    $scope.text = "asdfa";
    $scope.id = id;

    //test for article text
    $http({
        url: get_article_url,
        method: "GET",
        params: {
            article_id: id,
            username: localStorage.getItem('username'),
            id_token: localStorage.getItem('id_token')
        }
    })
        .success(function (data) {
            console.log(data);
            $scope.title = data.title;
            $scope.text = data.text;
            $scope.text = angular.element('<div>' + $scope.text + '</div>').text();
            $scope.trustedHTML = $sce.trustAsHtml($scope.text);
            console.log($scope.text);
        })

}

function commentsController($scope, $location, $http, $routeParams, $sce){
    var id = $routeParams.id;
    console.log(id);

    $scope.title;
    $scope.text = "asdfa";
    $scope.id = id;

    //test for article text
    $http({
        url: get_comments_url,
        method: "GET",
        params: {
            content_id: id,
            parent_id: id,
            username: localStorage.getItem('username'),
            id_token: localStorage.getItem('id_token'),
            timing: 'initial',
            action: 'retrieve_comments',
            level: 0,
            sibling_id: 1
        }
    })
        .success(function (data) {
            console.log(data);
            $scope.title = data.title;
            $scope.text = data.text;
            $scope.text = angular.element('<div>' + $scope.text + '</div>').text();
            $scope.trustedHTML = $sce.trustAsHtml($scope.text);
            console.log($scope.text);


        })
}


//INJECTIONS
//CardCtrl.$inject = ['$scope', '$http', 'authenticationService'];
loginController.$inject = ['$scope', '$http', 'authenticationService', '$location'];
signupController.$inject = ['$scope', '$http', 'authenticationService'];
logoutController.$inject = ['$scope', 'authenticationService', '$location'];
articleController.$inject = ['$scope', '$location', '$http', '$routeParams', '$sce'];
commentsController.$inject = ['$scope', '$location', '$http', '$routeParams', '$sce'];

//service
tribeApp.factory('authenticationService', function ($rootScope) {
    var sharedService = {};

    sharedService.message = '';

    sharedService.logIn_broadcast = function (username, id_token) {
        this.username = username;
        this.id_token = id_token;
        $rootScope.$broadcast('logIn_success');
    }

    sharedService.logOut_broadcast = function () {
        this.username = null;
        this.id_token = null;
        $rootScope.$broadcast("logOut");
    }

    return sharedService;
});

function swipe_up_complete() {

}

tribeApp.factory('cardService', ['$rootScope', function($rootScope){


}]);

tribeApp.factory('interactionService', function ($rootScope) {
    //

});