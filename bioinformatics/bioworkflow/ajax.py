import json
from django.http import Http404, HttpResponse
from django.conf import settings as djangoSettings
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def export_file(request):
    if request.is_ajax and request.method == 'POST':
        data = request.POST.get('data')
        # return "OK"
        with open(djangoSettings.STATIC_ROOT+'/outfile.json', 'w') as outfile:
            json.dump(data, outfile)
        return HttpResponse(json.dumps(djangoSettings.STATIC_ROOT),
                            content_type='application/json')
    else:
        return Http404
