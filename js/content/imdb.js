/*global $, chrome */
/*jslint browser: true, regexp:true */

var Imdb = function (params) {
    'use strict';
    this.links = params.links;
    this.settings = params.settings;
    this.i18n = {
        toOnline: 'Online',
        toDownload: 'Download'
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

Imdb.prototype = {
    init: function () {
        'use strict';
        this.parseFilm();

        if (this.settings.sites.imdb) {
            this.addButtons();
        }
    },
    parseFilm: function () {
        'use strict';
        this.film.localTitle = $('.itemprop[itemprop=name]:first')
            .text()
            .replace(/[']/g, ' ')
            .trim();
        this.film.originalTitle = $('.title-extra[itemprop=name]')
            .text()
            .replace(/(\(.+\))/g, '')
            .replace(/["']/g, ' ')
            .trim();
        this.film.year = parseInt($('.nobr:first').text().match(/\d+/), 10);
        this.film.rating = parseFloat($('.star-box-giga-star').text());
        this.film.poster = $('[itemprop=image]:first').attr('src');
        this.film.link = $('link[rel=canonical]').attr('href');
        this.film.id = this.film.link.match(/title\/(\w+)/)[1];
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
            ffDiv,
            table,
            link,
            siteType,
            site;

        ffDiv = $('<div>')
            .addClass('ffDiv');

        table = $('<table>');

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
                    .addClass('ffTdTitle')
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

                    table
                        .append(row);
                }

                ffDiv
                    .append(table);

                if (!table.is(':empty')) {
                    $('.infobar')
                        .after(ffDiv);
                }

                $('.searchIcon').click(searchIconClick);
            }
        }
    }
};

chrome.runtime.sendMessage({message: 'getParams'}, function (params) {
    'use strict';
    var imdb = new Imdb(params);
    imdb.init();
});

chrome.runtime.sendMessage({
    analytics: true,
    page: 'Imdb.com',
    type: 'Page'
});
