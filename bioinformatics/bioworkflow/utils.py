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

import json
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
    import workflow_manager as wfm

LOG = logging.getLogger(__name__)


def run_containers(request):
    template_url = constants.HEAT_TEMPLATE_URL
    parser = node_parser.Parser()
    gojs_nodes = parser.get_nodes()
    for gojs_node in gojs_nodes:
        stack_name = "stack" + str(randint(0, 10000))
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
    if len(gojs_nodes) > 0:
        processing(gojs_nodes, request)
    else:
        messages.error(request, _("gojs_node is None"))
    save_obj(gojs_nodes)
# """
# def run_containers(request):
#     #this is function load gojs_nodes is saved and run containers
#     gojs_nodes = load_obj()
#     if len(gojs_nodes) > 0:
#         processing(gojs_nodes, request)
#     else:
#         messages.error(request, _("None gojs_node"))
# """



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


def load_obj():
    with open(constants.PICKLE_PATH, 'rb') as f:
        return pickle.Unpickler(f).load()


def processing(gojs_nodes, request):
    """ processing with gojs_nodes
    step 1: create a WorkflowManager with name
    step 2: forloop gojs_nodes, convert each GoJsNode to NewTask and add list_tasks
    step 3: processing WorkflowManager
    """
    manager = wfm.WorkflowManager("workflow1")
    for node in gojs_nodes:
        new_task = wfm.NewTask(node)
        manager.list_tasks[node.key] = new_task
    messages.success(request, _("Processing..."))
    manager.processing(request)
    messages.success(
        request, _("Run complete {} tasks".format(len(gojs_nodes))))
