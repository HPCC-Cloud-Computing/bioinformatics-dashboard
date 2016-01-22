# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.


import requests
import logging
import pickle
from random import randint
from django.utils.translation import ugettext_lazy as _
from django.http import Http404

from horizon import exceptions
from horizon import messages

from openstack_dashboard import api
from openstack_dashboard.dashboards.bioinformatics.gojs_parser \
    import parser as node_parser
from openstack_dashboard.dashboards.bioinformatics.bioworkflow import constants
from openstack_dashboard.dashboards.bioinformatics.bioworkflow \
    import workflow as wf

LOG = logging.getLogger(__name__)


def run_containers(request):
    template_url = constants.HEAT_TEMPLATE_URL
    parser = node_parser.Parser()
    gojs_nodes = parser.get_nodes()
    for gojs_node in gojs_nodes:
        stack_name = "stack" + str(randint(0, 100))
        param = {
            'image': gojs_node.get_image_name(),
            'name': gojs_node.get_docker_container_name()
        }

        fields = {
            'stack_name': stack_name,
            'parameters': dict(param),
            'password': None,
            'template_url': template_url
        }

        try:
            stack_dict = api.heat.stack_create(request, **fields)
            while True:
                stack = get_stack(request, stack_dict['stack']['id'])
                if stack.stack_status == 'CREATE_COMPLETE':
                    messages.success(
                        request, _("Stack " + stack_name + " : "
                                   + stack.stack_status))
                    gojs_node.set_docker_container_ip(
                        get_container_ip(request, stack))
                    break
                if stack.stack_status == 'CREATE_FAILED':
                    messages.error(
                        request, _("Stack " + stack_name + " : "
                                   + stack.stack_status))
                    break
        except Exception:
            exceptions.handle(request)
    wf.processing(gojs_nodes, request)
    #if len(gojs_nodes) > 0:
    #    processing(gojs_nodes, request)
    #else:
    #    messages.error(request, _("None gojs_node"))
    save_obj(gojs_nodes)


def get_stack(request, stack_id):
    try:
        stack = api.heat.stack_get(request, stack_id)
        if stack.stack_status == 'DELETE_COMPLETE':
            # returning 404 to the ajax call removes the
            # row from the table on the ui
            raise Http404
        return stack
    except Http404:
        raise
    except Exception as e:
        messages.error(request, e)
        raise


def get_container_ip(request, stack):
    return stack.outputs[1]["output_value"]


def save_obj(obj):
    with open(constants.PICKLE_PATH, 'wb') as handle:
        pickle.dump(obj, handle)


def processing(gojs_nodes, request):
    manager = wf.WorkflowManager("workflow1")
    for node in gojs_nodes:
        new_stack = wf.NewTask(node)
        manager.list_tasks[node.key] = new_stack
    messages.success(request, _("run processing"))
    manager.processing(request)
    messages.success(request, _("DONE {}".format(len(gojs_nodes))))