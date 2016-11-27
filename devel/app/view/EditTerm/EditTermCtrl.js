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