#from mistralclient.api.v2.client import Client
import json
import uuid
from openstack_dashboard.dashboards.bioinformatics.bioworkflow import constants
from horizon import messages

# configure
# doc list gojs node len
workflow_name = 'template_workflow'

user = 'admin'
key = 'vandai123'
tenant = 'admin'
authurl = 'http://192.168.100.11:35357/v3'


def processing(gojs_nodes, request):
    # pre-processing

    list_key_node = {}
    for node in gojs_nodes:
        list_key_node[node.key] = node.name

    # processing

    list_task = {}
    for node in gojs_nodes:
        # before create dict_tack. check output
        if node.output_url is None:
            node.output_url = '{}/{}'.format(workflow_name, uuid.uuid4())
        if node.input_url is None:
            node.input_url = ''
        dict_task = {"action": "std.http url='http://{}/runtask/' method='GET' user={} key={} tenant={} authurl={} cm = '{}' input_file = '{}' output_file = '{}'" . format(node.get_docker_container_ip(), constants.USER, constants.KEY,
                                                                                                                                                                            constants.TENANT, constants.AUTHURL, node.command, node.input_url, node.output_url),
                     "publish": {"{}".format(node.name): "<% $.{} %>'".format(node.name)}
                     }
        if node.next_node_key:
            dict_task[
                "on-success"] = "{}".format(list_key_node[node.next_node_key]),
        list_task[node.name] = dict_task

    output = {}  # append them vao
    for node_name in list_task:
        output["out_{}".format(node_name)] = "<% $.{} %>".format(node_name)

    workflows = {
        "version": "2.0",
        "{}".format(workflow_name): {
            "type": "direct"
        }
    }
    workflows[workflow_name]["output"] = output
    workflows[workflow_name]["tasks"] = list_task

    # f = open(constants.MISTRAL_TEMPLATE_PATH, 'w')
    # f.write(json.dumps(workflows, indent=2))
    # f.close()
    messages.success(request, json.dumps(workflows, indent=2))
    #print(json.dumps(workflows, indent=2))
    # client = Client(username=user,
    #                 api_key=key,
    #                 project_name=tenant,
    #                 auth_url=authurl)

    # try:
    #     client.workflows.create(json.dumps(workflows, indent=2))
    #     client.executions.create(workflow_name)
    # except Exception, e:
    #     raise e

    # retrun gojs node, and we can get output_file and show it to dashboard
    return gojs_nodes


class NewTask(object):

    """docstring for NewNode"""

    def __init__(self, gojs_node):
        self.status = True
        self.number_link_to = int(0)
        self.name = gojs_node.name
        self.key = gojs_node.key
        self.image_name = gojs_node.image_name
        self.command = gojs_node.command
        self.input_url = gojs_node.input_url
        self.output_url = gojs_node.output_url
        self.prev_node_key = gojs_node.prev_node_key
        self.next_node_key = gojs_node.next_node_key
        self.container_ip = gojs_node.container_ip

    def run_task():
        # call API
        pass

    def get_status(self):
        return self.status


class WorkflowManager(object):

    """docstring for WorkflowManager"""

    def __init__(self, name):
        super(WorkflowManager, self).__init__()
        self.name = name
        self.list_tasks = {}

    def processing(self, request):
        self.count_link_to()
        start = self.get_start_task()
        while start:
            if start.output_url is None:
                start.output_url = 'abc/{}'.format(uuid.uuid4())
            payload = {'user': '{}'.format(user), 'key': '{}'.format(key), 'tenant': '{}'.format(tenant), 'authurl': '{}'.format(authurl),
                       'cm': '{}'.format(start.command), 'input_file': '{}'.format(start.input_url), 'output_url': '{}'.format(start.output_url)}
            r = requests.post(
                'http://{}:8080/runtask/'.format(start.container_ip), params=payload)
            messages.success(request, _(start.container_ip+':8080/runtask/'))
            # if r.text['status']:
            #     start = self.get_continue_task()
            # else:
            #     break
            break

    def get_start_task(self):
        for key in self.list_tasks:
            if self.list_tasks[key].number_link_to == 0:
                return self.list_tasks[key]
        else:
            return None
    # 2

    def count_link_to(self):
        for key in self.list_tasks:
            if self.list_tasks[key].next_node_key:
                task2 = self.list_tasks[self.list_tasks[key].next_node_key]
                self.list_tasks[
                    self.list_tasks[key].next_node_key].number_link_to = task2.number_link_to + 1

    def get_continue_task(self):
        for key in self.list_tasks:
            if self.list_tasks[key].next_node_key:
                return self.list_tasks[self.list_tasks[key].next_node_key]
        return None
