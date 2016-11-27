var guideApp = angular.module('guideApp', ['ngRoute', 'firebase']);

guideApp.constant('fbURL', 'https://terminology--guide.firebaseio.com/');

guideApp.service('fbRef', [
    'fbURL',
    function (fbURL) {
        return new Firebase(fbURL).child('terms');
    }
]);

guideApp.service('syncArrayTerms', [
    '$firebaseArray', 'fbRef',
    function ($firebaseArray, fbRef) {
        return $firebaseArray(fbRef);
    }]);

guideApp.service('fbAuth', [
    '$firebaseAuth', 'fbRef',
    function ($firebaseAuth, fbRef) {
        var self = this;
        self.authObj = $firebaseAuth(fbRef);

        self.logged = function (email, passwd,callback,callbackError) {
            
            if (self.authObj === undefined
                || self.authObj === null
                || self.authObj.provider !== 'password')
                self.authObj = $firebaseAuth(fbRef);
            self.authObj.$authWithPassword({email:email,password:passwd})
                .then(callback)
                .catch(callbackError);

        };

        self.logout = function () {
            if (self.authObj.provider || self.authObj.provider !== 'anonymous'){
                self.authObj.$unauth();
                self.authObj = $firebaseAuth(fbRef);
            }
        };
    }
]);

guideApp.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'ListTermsCtrl',
                templateUrl: 'view/ListTerms/listTerms.html'
            })
            .when('/login', {
                controller: 'LoginCtrl',
                templateUrl: 'view/Login/login.html'
            })
            .when('/logout', {
                controller: 'LoginCtrl',
                templateUrl: 'view/Login/login.html'
            })
            .when('/add', {
                controller: 'AddTermCtrl',
                templateUrl: 'view/AddTerm/addTerm.html'
            })
            .when('/edit/:idTerm', {
                controller: 'EditTermCtrl',
                templateUrl: 'view/EditTerm/editTerm.html'
            })
            .otherwise({redirectTo: '/'})
    }
]);

guideApp.controller('ListTermsCtrl', [
    '$scope', 'syncArrayTerms', 'fbAuth',
    function ($scope, syncArrayTerms, fbAuth) {
        $scope.terms = syncArrayTerms;

        fbAuth.authObj.$onAuth(function (authData) {
            if (authData) {
                $scope.userID = authData.uid;
            } else {
                $scope.userID = '';
            }
        });

        $scope.formatText = [];
        var i = 0;

        angular.forEach($scope.terms, function(value){
            $scope.formatText[i++] = true;
        });

        $scope.$on('goSearch', function (event, data) {
            if (data)
                $scope.search = data;
            else
                $scope.search = '';
        });
    }
]);
guideApp.controller('AddTermCtrl', [
    '$scope', '$location', 'syncArrayTerms', 'fbAuth',
    function ($scope, $location, syncArrayTerms, fbAuth) {
        function Term(nameTerm, descriptionTerm) {
            return {name: nameTerm, description: descriptionTerm}
        }

        $scope.newTerms = [Term()];
        
        

        $scope.addTerm = function () {
            $scope.newTerms.push(Term())
        };

        $scope.delTerm = function (i) {
            if($scope.newTerms.length >1){
                var newArray = [];

                angular.forEach($scope.newTerms, function (item, key) {
                    if(key != i){
                        newArray.push(item);
                    }
                });

                $scope.newTerms = newArray;
            }

        };

        $scope.sendTerms = function () {
            var auth = fbAuth.authObj.$getAuth();
            $scope.newTerms.forEach(function (item) {
                item.userId = auth.uid;
                syncArrayTerms.$add(item);
            });
            $location.path('/');
        }
    }
]);
guideApp.controller('EditTermCtrl', [
    '$scope', '$routeParams', '$location', 'syncArrayTerms',
    function ($scope, $routeParams, $location, syncArrayTerms, fbAuth) {

        var id = $routeParams.idTerm,
            index = syncArrayTerms.$indexFor(id);
        $scope.term = syncArrayTerms[index];
        console.log($scope.term.userId);
        // var authData = fbAuth.authObj.$getAuth();
        // if($scope.term.userId !== authData.uid){
        //     $location.path('/');
        // }

        $scope.delTerm = function () {
            syncArrayTerms.$remove($scope.term).then(function (data) {
                console.log(data);
                $location.path('/');
            });
        };

        $scope.sendTerm = function () {
            syncArrayTerms.$save($scope.term).then(function (data) {
                console.log(data);
                $location.path('/');
            });
        };
    }
]);
guideApp.controller('MainCtrl', [
    '$scope', '$location', 'fbAuth',
    function ($scope, $location, fbAuth) {
        $scope.auth = fbAuth;
        $scope.auth.authObj.$onAuth(function (authData) {
            if (authData) {
                $scope.user = authData.password.email;
                $scope.login = true;
            } else {
                $scope.user = 'Guast';
                $scope.login = false;
            }
        });

        $scope.activeNav = function(){
            return $location.path();
        };

        $scope.searchMain = '';


        $scope.goSearch = function () {
            $scope.$broadcast('goSearch', $scope.searchMain);
        }
    }
]);
guideApp.controller('LoginCtrl', [
    '$scope', '$location', 'fbAuth',
    function ($scope, $location, fbAuth) {

        fbAuth.authObj.$onAuth(function (authData) {
            if (authData && $location.path() === '/login') {
                $location.path('/');
            }
        });

        $scope.showNotify = '';

        $scope.signIn = function () {
            console.log(fbAuth.authObj);
            fbAuth.logged($scope.email, $scope.passwd,
                function (authData) {
                    console.log(authData);
                    $location.path('/');
                },
                function (error) {
                    
                    console.log(error.message);
                    $scope.showNotify = error.message;
                }
            );
        };
    }
]);