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