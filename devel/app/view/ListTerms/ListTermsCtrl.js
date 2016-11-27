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