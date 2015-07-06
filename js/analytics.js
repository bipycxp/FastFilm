/*global $:false, chrome:false */
/*jslint browser: true, nomen: true*/
var _gaq = window._gaq || [];
_gaq.push(['_setAccount', 'UA-41619690-1']);
_gaq.push(['_trackEvent', chrome.app.getDetails().version, 'Version']);

chrome.runtime.onMessage.addListener(
    function (request) {
        'use strict';
        if (request.analytics) {
            _gaq.push(['_trackEvent', request.page, request.type]);
            alert('f');
        }
    }
);

(function () {
    'use strict';
    var ga = document.createElement('script'),
        s = document.getElementsByTagName('script')[0];

    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';

    s.parentNode.insertBefore(ga, s);
}());
