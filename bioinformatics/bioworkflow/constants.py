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
import os
from django.conf import settings as djangoSettings


DIRNAME = os.path.dirname(__file__)
# JSON_PATH = "/usr/share/openstack-dashboard/openstack_dashboard/dashboards/bioinformatics/gojs_parser/test.json"
JSON_PATH = djangoSettings.STATIC_ROOT + "/outfile.json"
HEAT_TEMPLATE_URL = "https://raw.githubusercontent.com/cloudcomputinghust/bio-informatics/master/kiennt/PhatTrien/bioinformatics/bioworkflow/docker_container.yaml"
PICKLE_PATH = os.path.join(DIRNAME, 'pickle/gojsnode.pickle')
MISTRAL_TEMPLATE_PATH = "/usr/share/openstack-dashboard/openstack_dashboard/dashboards/bioinformatics/gojs_parser/file_name"

USER = 'admin'
KEY = 'bkcloud15@123'
TENANT = 'admin'
#AUTHURL = 'http://192.168.100.11:35357/v3'
AUTHURL = 'http://192.168.50.15:5000/v2.0/'
