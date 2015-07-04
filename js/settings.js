/*global $:false, chrome:false */
/*jslint browser: true, regexp: true */

var Settings = function (links) {
    'use strict';
    this.extensionId = chrome.app.getDetails().id;
    this.links = links;
    this.items = localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings')) : {};
    this.firstRun = localStorage.getItem('firstRun') ? JSON.parse(localStorage.getItem('firstRun')) : true;
};

Settings.prototype = {
    getTemplate: function (name) {
        'use strict';
        return $('[data-template="' + name + '"]')[0].innerHTML;
    },
    show: function () {
        'use strict';
        var elements = {
                sitesAndSearch: $('.row.sitesAndSearch'),
                siteTypes: $('.row.siteTypes'),
                searchFields: $('.ui.form.search'),
                settingsDescription: $('.settingsDescription'),
                share: $('.share'),
                dimmerContent: $('.text.content')
            },
            templates = {
                settingBlock: this.getTemplate('settingBlock'),
                fieldCheckbox: this.getTemplate('fieldCheckbox')
            },
            i18n = {
                sites: 'labelSites',
                toOnline: 'labelSitesOnline',
                toDownload: 'labelSitesDownload'
            },
            self = this,
            linksType,
            link,
            settingBlock,
            fields = '';

        for (linksType in this.links) {
            if (this.links.hasOwnProperty(linksType)) {
                settingBlock = templates.settingBlock;

                for (link in this.links[linksType]) {
                    if (this.links[linksType].hasOwnProperty(link)) {
                        fields += templates.fieldCheckbox
                            .replace(/\{\{LINK_NAME\}\}/g, link)
                            .replace('{{LABEL}}', this.links[linksType][link].title);
                    }
                }

                settingBlock = settingBlock
                    .replace('{{LABEL}}', chrome.i18n.getMessage(i18n[linksType]))
                    .replace('{{LABEL_NAME}}', linksType)
                    .replace('{{TOGGLE_NAME}}', linksType + 'Enabled')
                    .replace('{{FIELDS}}', fields);

                fields = '';

                if (linksType === 'sites') {
                    elements.sitesAndSearch.prepend(settingBlock);
                } else {
                    elements.siteTypes.append(settingBlock);
                }
            }
        }

        elements.share.ShareLink({
            title: 'Fast Film',
            text: chrome.i18n.getMessage('description'),
            url: 'https://chrome.google.com/webstore/detail/fast-film/' + this.extensionId,
            width: 640,
            height: 480
        });

        $('.ui.toggle.settingBlock').change(function (e) {
            var element = $(e.currentTarget);
            element.parents('.ui.form').find('.segment.settingFields')
                .toggleClass('disabled', !element.hasClass('checked'))
                .find('.checkbox')
                .toggleClass('disabled', !element.hasClass('checked'));
        });

        this.restore();

        $('.ui.checkbox').checkbox({
            onChange: function () {
                self.save();
            }
        });

        elements.sitesAndSearch
            .find('.ui.toggle.checkbox')
            .remove();
        elements.settingsDescription
            .text(chrome.i18n.getMessage('settingsDescription'));
        elements.dimmerContent
            .prepend(chrome.i18n.getMessage('thanksForInstall') + ' Fast Film');
        elements.dimmerContent.find('.header')
            .append(chrome.i18n.getMessage('tellAboutUs') + ' <a href="https://chrome.google.com/webstore/detail/fast-film/' + this.extensionId + '/reviews" target="_blank">Chrome Store</a>');
        elements.searchFields
            .find('h3')
            .text(chrome.i18n.getMessage('searchSettings'));
        elements.searchFields
            .find('.originalTitle')
            .text(chrome.i18n.getMessage('useOriginalTitle'));
        elements.searchFields
            .find('.year')
            .text(chrome.i18n.getMessage('year'));

        if (this.firstRun) {
            $('.ui.dimmer')
                .dimmer({opacity: 0.85})
                .dimmer('show');

            localStorage.setItem('firstRun', false);
        }
    },
    save: function () {
        'use strict';
        var checkbox = $('.ui.checkbox'),
            self = this;

        checkbox.each(function () {
            var name = $(this).parents('.ui.form').data('name');

            if ($(this).is('.toggle')) {
                self.items[name + 'Enabled'] = $(this).is('.checked');
            } else {
                self.items[name] = self.items[name] || {};
                self.items[name][$(this).data('name')] = $(this).is('.checked');
            }
        });

        localStorage.setItem('settings', JSON.stringify(this.items));
    },
    restore: function () {
        'use strict';
        var items = this.items,
            item,
            site;

        if ($.isEmptyObject(items)) {
            $('.ui.checkbox').checkbox('check');
            $('.ui.checkbox[data-name=year], .ui.checkbox[data-name=originalTitle]').checkbox('uncheck');
            this.save();
        } else {
            for (item in items) {
                if (items.hasOwnProperty(item)) {
                    if (typeof items[item] === 'object') {
                        for (site in items[item]) {
                            if (items[item].hasOwnProperty(site) && items[item][site]) {
                                $('.ui.checkbox[data-name=' + site + ']').checkbox('check');
                            }
                        }
                    } else {
                        $('.ui.checkbox[data-name=' + item + ']')
                            .checkbox('check')
                            .checkbox(items[item] ? 'check' : 'uncheck');
                    }
                }
            }
        }
    }
};

chrome.runtime.sendMessage({message : 'getLinks'}, function (links) {
    'use strict';
    var settings = new Settings(links);

    settings.show();

    chrome.runtime.sendMessage({analytics: 'settings'});
});

chrome.runtime.sendMessage({analytics: 'settings'});
