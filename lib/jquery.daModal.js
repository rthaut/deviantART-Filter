/**
 * Simple DeviantArt Modal Plugin
 * @author Ryan Thaut
 */
(function ($) {
    $.fn.daModal = function (options) {
        return $.daModal.init(this, options);
    };

    $.daModal = {
        'defaults': {
            'title': '',
            'footnote': '',
            'width': '50%',
            'height': '50%',
        },

        'objects': {
            'overlay': null,
            'modal': null,
        },

        'init': function (elem, options) {
            $.daModal.create(elem, options);
            $.daModal.open();
            return elem;
        },

        'create': function (elem, options) {
            var settings = $.extend({}, $.daModal.defaults, options);

            if (!$.daModal.objects.modal) {
                var modal = $('<div/>')
                    .addClass('modal modal-rounded with-shadow')
                    .css({
                        'display': 'none',
                        'position': 'fixed',
                        'width': settings.width,
                        'height': settings.height,
                        'left': 'calc((100% - ' + settings.width + ') / 2)',
                        'top': 'calc((100% - ' + settings.height + ') / 2)',
                        'zIndex': 200,
                    })
                    .appendTo('body');
                $.daModal.objects.modal = modal;

                $('<a/>')
                    .addClass('x')
                    .on('click', this.close)
                    .appendTo(modal);

                $('<h2/>')
                    .html(settings.title)
                    .appendTo(modal);

                $('<div/>')
                    .addClass('daModal-content')
                    .attr('id', 'modal-content')
                    .css({
                        'overflow': 'auto',
                        'padding': '15px',
                        'height': 'calc(100% - 54px - 50px - 30px)', // 54px: header; 50px: footer (buttons); 30px: vertical padding
                        'width': 'calc(100% - 30px)',        // 30px: horizontal padding
                    })
                    .appendTo(modal);

                var footer = $('<div/>')
                    .css({
                        'borderTop': '1px solid #AAB5AB',
                        'boxShadow': '0 1px 0 rgba(255, 255, 255, 0.75) inset',
                        'height': '50px',
                        'margin': '0 15px',
                        'textAlign': 'right',
                    })
                    .appendTo(modal);

                $('<small/>')
                    .addClass('text')
                    .css({
                        'float': 'left',
                        'lineHeight': '50px',
                    })
                    .html(settings.footnote)
                    .appendTo(footer);

                $('<a/>')
                    .addClass('smbutton smbutton-lightgreen smbutton-size-large smbutton-shadow')
                    .html('Done')
                    .on('click', this.close)
                    .appendTo(footer);
            }

            if (!$.daModal.objects.overlay) {
                var overlay = $('<div/>')
                    .attr('id', 'modalfade')
                    .on('click', this.close)
                    .appendTo('body');
                $.daModal.objects.overlay = overlay;
            }

            $('div#modal-content').append(elem);

            return elem;
        },

        'open': function () {
            $.daModal.objects.overlay.show();
            $.daModal.objects.modal.show();
        },

        'close': function () {
            $.daModal.objects.modal.hide();
            $.daModal.objects.overlay.hide();
        }
    };
}(jQuery));
