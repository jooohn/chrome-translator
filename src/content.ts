/// <reference path='../bower_components/DefinitelyTyped/jquery/jquery.d.ts' />
import $ = require('jquery');

module translator {
    // run script
    $(function() {
        var resultView = new ResultView($('body'));
        var lastSearch = '';
        window.addEventListener('mouseup', function() {
            var selection = window.getSelection();
            var selectedText = selection.toString();
            if (lastSearch == selectedText) {
                // do nothing
                return;
            } else {
                lastSearch = selectedText;
            }

            resultView.hide();
            if (selectedText.length !== 0) {
                Translator
                    .search(selectedText)
                    .done(resultView.render.bind(resultView))
                    .fail(console.log);
            }
        });
    });

    class ResultView {
        static STYLE = {
            'color': '#333',
            'background-color': 'rgba(255,255,255,0.8)',
            'text-align': 'left',
            'position': 'fixed',
            'top': '0px',
            'right': '0px',
            'z-index': 9999
        };

        private $view: JQuery;
        private $list: JQuery;

        constructor(
            private $parent: JQuery,
            private fadeDuration: number = 300
        ) {
            this.$view = $('<div></div>').css(ResultView.STYLE).hide();
            this.$list = $('<ul></ul>').appendTo(this.$view);

            this.$parent.append(this.$view);
        }

        public render(translation: TranslationObject) {
            this.$list.empty();
            translation.searchResult.forEach((title) => {
                this.$list.append($('<li>' + title.title + '</li>'));
            });

            this.$view
                .slideDown(this.fadeDuration);
        }

        public hide() {
            this.$view.slideUp(this.fadeDuration);
        }
    }

    class TranslationObject {
        public originalText;
        public result;
        public searchResult: {
            id: string;
            title: string;
        }[] = [];
    }

    class Translator {
        static ENDPOINT = 'http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite';
        static BASE_PARAMS = {
            Dic: 'EJdict',
            Scope: 'HEADWORD',
            Match: 'STARTWITH',
            Merge: 'AND',
            Prof: 'XHTML',
            PageSize: 20,
            PageIndex: 0
        };

        public static search(originalText: string): JQueryPromise<TranslationObject> {
            var params = $.extend({ Word: originalText }, Translator.BASE_PARAMS);

            // translate via Dejizo API
            return $.ajax({
                url: Translator.ENDPOINT,
                data: params
            }).done((response: XMLDocument) => {
                var translation = new TranslationObject;
                translation.originalText = originalText;
                $(response)
                    .find('TitleList > DicItemTitle')
                    .each(function() {
                        translation.searchResult.push({
                            id: $(this).find('ItemID').text().trim(),
                            title: $(this).find('Title').text().trim()
                        });
                    });

                return translation;
            });
        }
    }
}
