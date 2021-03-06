/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular
    .module('horizon.dashboard.container.containers')
    .factory('horizon.dashboard.container.containers.delete.service', deleteService);

  deleteService.$inject = [
    '$location',
    '$q',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.modal.deleteModalService',
    'horizon.framework.widgets.toast.service',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.events'
  ];

  /**
   * @ngDoc factory
   * @name horizon.dashboard.container.containers.delete.service
   * @Description
   * Brings up the delete containers confirmation modal dialog.
   * On submit, delete selected resources.
   * On cancel, do nothing.
   */
  function deleteService(
    $location, $q, zun, policy, actionResult, gettext, $qExtensions, deleteModal, toast, resourceType, events
  ) {
    var scope;
    var context = {
      labels: null,
      deleteEntity: deleteEntity,
      successEvent: events.DELETE_SUCCESS
    };
    var service = {
      initScope: initScope,
      allowed: allowed,
      perform: perform
    };
    var notAllowedMessage = gettext("You are not allowed to delete containers: %s");

    return service;

    //////////////

    // include this function in your service
    // if you plan to emit events to the parent controller
    function initScope($scope) {
      scope = $scope;
    }

    function allowed() {
      return $qExtensions.booleanAsPromise(true);
    }

    // delete selected resource objects
    function perform(selected) {
      var selected = angular.isArray(selected) ? selected : [selected];
      context.labels = labelize(selected.length);
      return $qExtensions.allSettled(selected.map(checkPermission)).then(afterCheck);
    }

    function labelize(count){
      return {
        title: ngettext('Confirm Delete Container',
                        'Confirm Delete Containers', count),
        /* eslint-disable max-len */
        message: ngettext('You have selected "%s". Please confirm your selection. Deleted container is not recoverable.',
                          'You have selected "%s". Please confirm your selection. Deleted containers are not recoverable.', count),
        /* eslint-enable max-len */
        submit: ngettext('Delete Container',
                         'Delete Containers', count),
        success: ngettext('Deleted Container: %s.',
                          'Deleted Containers: %s.', count),
        error: ngettext('Unable to delete Container: %s.',
                        'Unable to delete Containers: %s.', count)
      };
    }

    // for batch delete
    function checkPermission(selected) {
      return {promise: allowed(selected), context: selected};
    }

    // for batch delete
    function afterCheck(result){
      var outcome = $q.reject();  // Reject the promise by default
      if (result.fail.length > 0) {
        toast.add('error', getMessage(notAllowedMessage, result.fail));
        outcome = $q.reject(result.fail);
      }
      if (result.pass.length > 0) {
        outcome = deleteModal.open(scope, result.pass.map(getEntity), context).then(createResult);
      }
      return outcome;
    }

    function createResult(deleteModalResult) {
      // To make the result of this action generically useful, reformat the return
      // from the deleteModal into a standard form
      var result = actionResult.getActionResult();
      deleteModalResult.pass.forEach(function markDeleted(item) {
        result.deleted(resourceType, getEntity(item).id);
      });
      deleteModalResult.fail.forEach(function markFailed(item) {
        result.failed(resourceType, getEntity(item).id);
      });
      if(result.result.failed.length == 0 && result.result.deleted.length > 0){
        $location.path('/project/container/containers');
      }else{
        return result.result;
      }
    }

    function getMessage(message, entities) {
      return interpolate(message, [entities.map(getName).join(", ")]);
    }

    function getName(result) {
      return getEntity(result).name;
    }

    // for batch delete
    function getEntity(result) {
      return result.context;
    }

    // call delete REST API
    function deleteEntity(id){
      return zun.deleteContainer(id, true);
    }
  }
})();
