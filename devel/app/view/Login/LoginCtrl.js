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