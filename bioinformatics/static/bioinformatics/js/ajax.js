$(document).ready(function() {
    // AJAX POST
    $('#exportButton').click(function() {
        $("#exportAlert").show();
        $("#exportAlert").fadeTo(3000, 500).slideUp(500, function() {
            $("#exportAlert").alert('close');
        });
        $.ajax({
            type: "POST",
            url: "ajax/exportfile/",
            cache: false,
            dataType: "json",
            data: {
                "data": bioDiagram.model.toJson()
            },
            success: function(data) {
                // alert("Export Success");
            },
            error: function(xhr, errmsg, err) {
                console.log(xhr.status); // provide a bit more info about the error to the console
            }

        });

    });

    // AJAX GET
    $('#runButton').click(function() {
        $("#runAlert").show();
        $("#runAlert").fadeTo(10000, 500).slideUp(500, function() {
            $("#runAlert").alert('close');
        });
        $.ajax({
            type: "GET",
            url: "ajax/run/",
            cache: false,
            success: function() {
                // alert("Run Success");
            },
            error: function(xhr, errmsg, err) {
                console.log(xhr.status); // provide a bit more info about the error to the console
            }

        });

    });

    // using jQuery
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    function sameOrigin(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });


});