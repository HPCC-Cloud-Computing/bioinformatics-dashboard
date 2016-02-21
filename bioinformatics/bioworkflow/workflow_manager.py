import requests
# from horizon import messages
# from django.utils.translation import ugettext_lazy as _
# import json
from openstack_dashboard.dashboards.bioinformatics.bioworkflow import constants

# user = 'admin'
# key = 'vandai123'
# tenant = 'admin'
# authurl = 'http://192.168.100.11:35357/v3'
# authurl = 'http://192.168.100.11:5000/v2.0/'


class NewTask(object):

    """docstring for NewNode"""

    def __init__(self, gojs_node):
        self.status = True
        self.result = None
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

    def run(self):
        if self.output_url is None:
            self.output_url = 'abc/{}'.format(uuid.uuid4())

        # fail toluen input_file exists:
        self.input_url = self.input_url.split("|")[0]
        payload = {'user': '{}'.format(constants.USER), 'key': '{}'.format(constants.KEY), 'tenant': '{}'.format(constants.TENANT), 'authurl': '{}'.format(constants.AUTHURL),
                   'cm': '{}'.format(self.command), 'input_file': '{}'.format(self.input_url), 'output_file': '{}'.format(self.output_url)}
        self.result = requests.post(
            'http://{}:8080/runtask/'.format(self.container_ip), data=payload)

    def get_status(self):
        return self.status


class WorkflowManager(object):

    """docstring for WorkflowManager"""

    def __init__(self, name):
        super(WorkflowManager, self).__init__()
        self.name = name
        self.list_tasks = {}

    def processing(self, request):
        """
        """
        # list_tasks is added some New_Task at processing function utils.py
        start = self.get_start_task()
        self.count_link_to()
        while start is not None:
            start.run()
            # if start.result.text['status']:
            #     start = self.get_continue_task()
            # else:
            #     break
            start = self.get_continue_task(start)

    def get_start_task(self):
        for key in self.list_tasks:
            if self.list_tasks[key].number_link_to == 0:
                return self.list_tasks[key]
        else:
            return None

    def count_link_to(self):
        for key in self.list_tasks:
            if self.list_tasks[key].next_node_key:
                task2 = self.list_tasks[self.list_tasks[key].next_node_key]
                self.list_tasks[
                    self.list_tasks[key].next_node_key].number_link_to = task2.number_link_to + 1

    def get_continue_task(self, task):
        if task.next_node_key:
            return self.list_tasks[task.next_node_key]
        return None

    def get_continue_tasks(self):
        tmp = []
        for key in self.list_tasks:
            if self.list_tasks[key].next_node_key:
                tmp.append(self.list_tasks[self.list_tasks[key].next_node_key])
        return tmp