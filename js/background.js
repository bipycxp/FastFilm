/*global $, chrome */
/*jslint browser: true*/

var Links = function () {
    'use strict';
    this.sites = {
        kinopoisk: {
            title: 'Kinopoisk.ru',
            link: ''
        },
        imdb: {
            title: 'IMDb.com',
            link: ''
        }
    };

    this.toOnline = {
        vk: {
            title: 'VK.com',
            link: 'https://vk.com/video?len=2&q={{SEARCH_STRING}}&section=search'
        },
        ex: {
            title: 'EX.ua',
            link: 'http://www.ex.ua/search?s={{SEARCH_STRING}}'
        },
        fs: {
            title: 'FS.to',
            link: 'http://fs.to/video/films/search.aspx?search={{SEARCH_STRING}}'
        },
        kinogo: {
            title: 'Kinogo.co',
            link: 'http://kinogo.co/index.php?do=search&story={{SEARCH_STRING}}&result_form=1&full_search=0&search_start=1&subaction=search',
            noURI : true
        },
        megogo: {
            title: 'MEGOGO.net',
            link: 'http://megogo.net/ru/search?q={{SEARCH_STRING}}'
        },
        ivi: {
            title: 'ivi.ru',
            link: 'http://www.ivi.ru/search/simple/?q={{SEARCH_STRING}}'
        },
        seasonvar: {
            title: 'Seasonvar.ru',
            link: 'http://seasonvar.ru/search?q={{SEARCH_STRING}}'
        },
        'o-nline': {
            title: 'O-nline.ws',
            link: 'http://o-nline.ws/index.php?do=search&story={{SEARCH_STRING}}&result_form=1&full_search=0&search_start=1&subaction=search'
        }
    };

    this.toDownload = {
        rutracker : {
            title : 'Rutracker.org',
            link : 'http://rutracker.org/forum/tracker.php?nm={{SEARCH_STRING}}'
        },
        tfile : {
            title : 'tFile.me',
            link : 'http://tfile.me/forum/ssearch.php?q={{SEARCH_STRING}}',
            noURI : true
        },
        torrentino : {
            title : 'Torrentino.com',
            link : 'http://www.torrentino.com/search?search={{SEARCH_STRING}}'
        },
        rutor : {
            title : 'Rutor.org',
            link : 'http://new-rutor.org/search/0/0/100/0/{{SEARCH_STRING}}'
        },
        nnm_club : {
            title : 'Nnm-club.me',
            link : 'http://nnm-club.me/forum/tracker.php?nm={{SEARCH_STRING}}'
        },
        hdclub : {
            title : 'HDclub.org',
            link : 'http://hdclub.org/browse.php?search={{SEARCH_STRING}}',
            noURI : true
        },
        pirate_bay : {
            title : 'ThePirateBay.se',
            link : 'http://thepiratebay.se/search/{{SEARCH_STRING}}/0/7/200'
        },
        torrent_reactor : {
            title : 'TorrentReactor.net',
            link : 'http://torrentreactor.com/torrents-search/{{SEARCH_STRING}}'
        },
        kickass : {
            title : 'Kickass.to',
            link : 'http://kickass.to/search/{{SEARCH_STRING}}'
        }
    };
};

var links = new Links(),
    oldVersion = localStorage.getItem('version'),
    newVersion = chrome.app.getDetails().version;

/*jslint unparam: true */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        'use strict';
        switch (request.message) {
        case 'getParams':
            sendResponse({
                settings: JSON.parse(localStorage.getItem('settings')),
                links: {
                    toOnline: links.toOnline,
                    toDownload: links.toDownload
                }
            });
            break;
        case 'getLinks':
            sendResponse(links);
            break;
        }
    }
);
/*jslint unparam: false */

if (newVersion !== oldVersion) {
    localStorage.setItem('firstRun', !oldVersion);

    if (!oldVersion || newVersion.replace(/\.\d+$/, '') > oldVersion.replace(/\.\d+$/, '')) {
        chrome.tabs.create({
            url: chrome.extension.getURL('html/settings.html')
        });
    }

    localStorage.setItem('version', chrome.app.getDetails().version);
}
