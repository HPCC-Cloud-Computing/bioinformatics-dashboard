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
import gojsnode
import ast
from openstack_dashboard.dashboards.bioinformatics.bioworkflow import constants


class Parser(object):

    def __init__(self):
        self.nodes = []

    def read_json(self,
                  json_path=constants.JSON_PATH):
        with open(json_path) as data_file:
            data = json.load(data_file)
        return ast.literal_eval(data)

    def get_node_data(self):
        node_datas = self.read_json()["nodeDataArray"]
        for i in range(0, len(node_datas)):
            if node_datas[i]["input"]["container_name_input"].strip() != '':
                container_name_input = node_datas[i][
                    "input"]["container_name_input"].strip()
            else:
                container_name_input = None
            node = gojsnode.GoJsNode(
                node_datas[i]["name"].strip(),
                node_datas[i]["key"],
                node_datas[i]["image"]["image_name"].strip(),
                node_datas[i]["command"].strip(),
                container_name_input,
                node_datas[i]["input"]["var_input"],
            )
            self.nodes.append(node)

    def get_link_data(self):
        link_datas = self.read_json()["linkDataArray"]
        for i in range(0, len(link_datas)):
            from_node = filter(lambda x: x.key == link_datas[
                               i]["from"], self.nodes)
            for node in from_node:
                node.link_to(link_datas[i]["to"])

            to_node = filter(lambda x: x.key == link_datas[
                             i]["to"], self.nodes)
            for node in to_node:
                node.link_from(link_datas[i]["from"])

    def get_nodes(self):
        self.get_node_data()
        self.get_link_data()
        return self.nodes
