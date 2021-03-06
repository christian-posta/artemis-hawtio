/// <reference path="artemisPlugin.ts"/>
var ARTEMIS;
(function (ARTEMIS) {
    ARTEMIS.module.controller("ARTEMIS.TreeHeaderController", ["$scope", function ($scope) {
        $scope.expandAll = function () {
            Tree.expandAll("#artemistree");
        };
        $scope.contractAll = function () {
            Tree.contractAll("#artemistree");
        };
    }]);
    ARTEMIS.module.controller("ARTEMIS.TreeController", ["$scope", "$location", "workspace", "localStorage", function ($scope, $location, workspace, localStorage) {
        var artemisJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";
        ARTEMIS.log.info("init tree " + artemisJmxDomain);
        $scope.$on("$routeChangeSuccess", function (event, current, previous) {
            // lets do this asynchronously to avoid Error: $digest already in progress
            setTimeout(updateSelectionFromURL, 50);
        });
        $scope.$watch('workspace.tree', function () {
            reloadTree();
        });
        $scope.$on('jmxTreeUpdated', function () {
            reloadTree();
        });
        function reloadTree() {
            ARTEMIS.log.info("workspace tree has changed, lets reload the artemis tree");
            var children = [];
            var tree = workspace.tree;
            if (tree) {
                var domainName = artemisJmxDomain;
                var folder = tree.get(domainName);
                if (folder) {
                    children = folder.children;
                }
                if (children.length) {
                    var firstChild = children[0];
                    // the children could be AMQ 5.7 style broker name folder with the actual MBean in the children
                    // along with folders for the Queues etc...
                    if (!firstChild.typeName && firstChild.children.length < 4) {
                        // lets avoid the top level folder
                        var answer = [];
                        angular.forEach(children, function (child) {
                            answer = answer.concat(child.children);
                        });
                        children = answer;
                    }
                }
                var treeElement = $("#artemistree");
                Jmx.enableTree($scope, $location, workspace, treeElement, children, true);
                // lets do this asynchronously to avoid Error: $digest already in progress
                setTimeout(updateSelectionFromURL, 50);
            }
        }
        function updateSelectionFromURL() {
            Jmx.updateTreeSelectionFromURLAndAutoSelect($location, $("#artemistree"), function (first) {
                // use function to auto select the queue folder on the 1st broker
                var jms = first.getChildren()[0];
                ARTEMIS.log.info("%%%%%%" + jms);
                var queues = jms.getChildren()[0];
                if (queues && queues.data.title === 'Queue') {
                    first = queues;
                    first.expand(true);
                    return first;
                }
                return null;
            }, true);
        }
    }]);
})(ARTEMIS || (ARTEMIS = {}));
//# sourceMappingURL=tree.js.map