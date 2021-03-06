/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
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

  /**
   * @ngdoc controller
   * @name createContainerInfoController
   * @ngController
   * @description
   * Controller for the container info step in create workflow
   */
  angular
    .module('horizon.dashboard.container.containers')
    .controller('createContainerInfoController', createContainerInfoController);

  createContainerInfoController.$inject = [
    '$q',
    '$scope',
    'horizon.dashboard.container.basePath',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.framework.util.i18n.gettext'
  ];

  function createContainerInfoController($q, $scope, basePath, zun, gettext) {
    var ctrl = this;
  }
})();
