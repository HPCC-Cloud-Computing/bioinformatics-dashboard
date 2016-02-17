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
from random import randint


class GoJsNode(object):

    def __init__(self,
                 name,
                 key,
                 image_name,
                 command,
                 swift_container_input,
                 inputs):
        self.name = name
        self.key = key
        self.image_name = image_name
        self.command = command
        self.docker_container_name = "container" + str(randint(0, 1000))
        self.swift_container_input = swift_container_input
        self.inputs = inputs
        self.input_url = self.check_and_set(
            self.swift_container_input, self.get_unite_input())
        self.output_url = self.get_output_file()
        self.prev_node_key = None
        self.next_node_key = None

    def check_and_set(self, obj1, obj2):
        if obj1 is not None and obj2 is not None:
            return obj1 + "/" + obj2
        else:
            return None

    def set_docker_container_ip(self, container_ip):
        self.container_ip = container_ip

    def link_from(self, prev_node_key):
        self.prev_node_key = prev_node_key

    def link_to(self, next_node_key):
        self.next_node_key = next_node_key

    def grep_list(self, type):
        list_grepped = []
        for in_item in self.inputs:
            for key, value in in_item.iteritems():
                if type in key:
                    list_grepped.append(value.strip())
        return list_grepped

    def get_input_list(self):
        if len(self.grep_list('in')) == 0:
            return None
        else:
            return self.grep_list('in')

    def get_output_file(self):
        if len(self.grep_list('out')) == 0:
            return None
        else:
            return self.grep_list('out')[0]

    def get_unite_input(self):
        if self.get_input_list() is not None:
            input_list = self.get_input_list()
            united = ""
            for item in input_list:
                united = united + item + "|"
            return united
        else:
            return None

    def get_name(self):
        return self.name

    def get_key(self):
        return self.key

    def get_docker_container_name(self):
        return self.docker_container_name

    def get_docker_container_ip(self):
        return self.container_ip

    def get_image_name(self):
        return self.image_name

    def get_prev_node(self):
        return self.prev_node_key

    def get_next_node(self):
        return self.next_node_key

    def get_input_url(self):
        return self.input_url

    def get_output_url(self):
        return self.output_url

    def get_inputs(self):
        return self.inputs
