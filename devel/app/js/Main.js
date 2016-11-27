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
