var ARTEMIS;
(function (ARTEMIS) {
    ARTEMIS.log = Logger.get("ARTEMIS");
    ARTEMIS.jmxDomain = 'org.apache.ARTEMIS';
    function getSelectionQueuesFolder(workspace) {
        function findQueuesFolder(node) {
            if (node) {
                if (node.title === "Queues" || node.title === "Queue") {
                    return node;
                }
                var parent = node.parent;
                if (parent) {
                    return findQueuesFolder(parent);
                }
            }
            return null;
        }
        var selection = workspace.selection;
        if (selection) {
            return findQueuesFolder(selection);
        }
        return null;
    }
    ARTEMIS.getSelectionQueuesFolder = getSelectionQueuesFolder;
    function getSelectionTopicsFolder(workspace) {
        function findTopicsFolder(node) {
            var answer = null;
            if (node) {
                if (node.title === "Topics" || node.title === "Topic") {
                    answer = node;
                }
                if (answer === null) {
                    angular.forEach(node.children, function (child) {
                        if (child.title === "Topics" || child.title === "Topic") {
                            answer = child;
                        }
                    });
                }
            }
            return answer;
        }
        var selection = workspace.selection;
        if (selection) {
            return findTopicsFolder(selection);
        }
        return null;
    }
    ARTEMIS.getSelectionTopicsFolder = getSelectionTopicsFolder;
    /**
     * Sets $scope.row to currently selected JMS message.
     * Used in:
     *  - ARTEMIS/js/browse.ts
     *  - camel/js/browseEndpoint.ts
     *
     * TODO: remove $scope argument and operate directly on other variables. but it's too much side effects here...
     *
     * @param message
     * @param key unique key inside message that distinguishes between values
     * @param $scope
     */
    function selectCurrentMessage(message, key, $scope) {
        // clicking on message's link would interfere with messages selected with checkboxes
        $scope.gridOptions.selectAll(false);
        var idx = Core.pathGet(message, ["rowIndex"]);
        var jmsMessageID = Core.pathGet(message, ["entity", key]);
        $scope.rowIndex = idx;
        var selected = $scope.gridOptions.selectedItems;
        selected.splice(0, selected.length);
        if (idx >= 0 && idx < $scope.messages.length) {
            $scope.row = $scope.messages.find(function (msg) { return msg[key] === jmsMessageID; });
            if ($scope.row) {
                selected.push($scope.row);
            }
        }
        else {
            $scope.row = null;
        }
    }
    ARTEMIS.selectCurrentMessage = selectCurrentMessage;
    /**
     * - Adds functions needed for message browsing with details
     * - Adds a watch to deselect all rows after closing the slideout with message details
     * TODO: export these functions too?
     *
     * @param $scope
     */
    function decorate($scope) {
        $scope.selectRowIndex = function (idx) {
            $scope.rowIndex = idx;
            var selected = $scope.gridOptions.selectedItems;
            selected.splice(0, selected.length);
            if (idx >= 0 && idx < $scope.messages.length) {
                $scope.row = $scope.messages[idx];
                if ($scope.row) {
                    selected.push($scope.row);
                }
            }
            else {
                $scope.row = null;
            }
        };
        $scope.$watch("showMessageDetails", function () {
            if (!$scope.showMessageDetails) {
                $scope.row = null;
                $scope.gridOptions.selectedItems.splice(0, $scope.gridOptions.selectedItems.length);
            }
        });
    }
    ARTEMIS.decorate = decorate;
})(ARTEMIS || (ARTEMIS = {}));