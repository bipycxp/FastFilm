/*global $:false, chrome:false */
/*jslint browser: true, regexp:true */

var Kinopoisk = function (params) {
    'use strict';
    this.links = params.links;
    this.settings = params.settings;
    this.i18n = {
        toOnline: 'онлайн',
        toDownload: 'скачать'
    };
    this.film = {
        id: 0,
        localTitle: '',
        originalTitle: '',
        year: 0,
        rating: 0,
        poster: '',
        link: ''
    };
};

Kinopoisk.prototype = {
    init: function () {
        'use strict';
        this.parseFilm();

        if (this.settings.sites.kinopoisk) {
            this.addButtons();
        }
    },
    parseFilm: function () {
        'use strict';
        this.film.localTitle = $('.moviename-big:first')
            .text()
            .match(/[^(]+/)[0]
            .replace(/[']/g, ' ')
            .trim();
        this.film.originalTitle = $('[itemprop="alternativeHeadline"]')
            .text()
            .replace(/[']/g, ' ')
            .trim();
        this.film.year = parseInt($('a[href^="/lists/m_act%5Byear%5D/"]').text(), 10);
        this.film.rating = parseFloat($('.rating_ball').text());
        this.film.poster = $('#wrap').find('img').attr('src');
        this.film.link = $('link[rel=canonical]').attr('href');
        this.film.id = this.film.link.match(/film\/(\d+)/)[1];

        chrome.runtime.sendMessage({message: 'film', data: this.film});
    },
    getSearchString: function () {
        'use strict';
        var string = '',
            temp;

        temp = this.settings.search.originalTitle && this.film.originalTitle ? this.film.originalTitle : this.film.localTitle;
        string += temp;
        temp = this.settings.search.year ? ' ' + this.film.year : '';
        string += temp;

        return string;
    },
    addButtons: function () {
        'use strict';
        var row = '',
            tdTitle,
            tdLinks,
            a,
            div,
            link,
            siteType,
            site;

        function searchIconClick(e) {
            chrome.runtime.sendMessage({
                analytics: true,
                page: $(e.currentTarget).attr('title'),
                type: 'Transition'
            });
        }

        for (siteType in this.links) {
            if (this.links.hasOwnProperty(siteType) && this.settings[siteType + 'Enabled']) {
                tdTitle = $('<td>')
                    .addClass('type')
                    .text(this.i18n[siteType]);
                row = $('<tr>');
                tdLinks = $('<td>');

                for (site in this.links[siteType]) {
                    if (this.links[siteType].hasOwnProperty(site) && this.settings[siteType][site]) {
                        link = this.links[siteType][site].link
                            .replace('{{SEARCH_STRING}}', !this.links[siteType][site].noURI ? encodeURIComponent(this.getSearchString()) : this.getSearchString());
                        div = $('<div>')
                            .css('background', 'url(' + chrome.extension.getURL('../img/icons/' + site + '.png') + ')')
                            .attr('title', this.links[siteType][site].title)
                            .addClass('searchIcon');
                        a = $('<a>')
                            .attr('href', link)
                            .attr('target', '_blank')
                            .append(div);
                        tdLinks = tdLinks
                            .append(a);
                    }
                }

                if (!tdLinks.is(':empty')) {
                    row
                        .append(tdTitle)
                        .append(tdLinks);

                    $('#infoTable').find('table.info')
                        .append(row);
                }

                $('.searchIcon').click(searchIconClick);
            }
        }
    }
};

chrome.runtime.sendMessage({message: 'getParams'}, function (params) {
    'use strict';
    var kinopoisk = new Kinopoisk(params);
    kinopoisk.init();
});

chrome.runtime.sendMessage({
    analytics: true,
    page: 'Kinopoisk.ru',
    type: 'Page'
});
