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

from horizon import views
# from horizon import exceptions
from horizon import messages
import json

from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import Http404, HttpResponse
from django.conf import settings as djangoSettings
from django.utils.translation import ugettext_lazy as _

from openstack_dashboard.dashboards.bioinformatics.bioworkflow import utils


class IndexView(views.APIView):
    # A very simple class-based view...
    template_name = 'bioinformatics/bioworkflow/index.html'

    def get_data(self, request, context, *args, **kwargs):
        # Add data to the context here...
        return context


@ensure_csrf_cookie
def export_file(request):
    if request.is_ajax and request.method == 'POST':
        data = request.POST.get('data')
        with open(djangoSettings.STATIC_ROOT+'/outfile.json', 'w') as outfile:
            json_data = json.dump(data, outfile)
        return HttpResponse(json.dumps(json_data, indent=4),
                            content_type='application/json; charset=utf-8')
    else:
        return Http404


@ensure_csrf_cookie
def run(request):
    try:
        if request.is_ajax and request.method == 'GET':
            utils.run_containers(request)
            return HttpResponse(status=200)
        else:
            raise Http404
    except Http404:
        raise
    except Exception as e:
        messages.error(request, e)
        raise
