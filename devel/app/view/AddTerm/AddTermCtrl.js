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