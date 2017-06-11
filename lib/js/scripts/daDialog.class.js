/**
 * HTML5 Dialog module using deviantART's styling
 */
var daDialog = {
    /**
     * Creates and shows a new HTML5 dialog
     * @param {HTMLElement} content
     * @param {String} [title]
     * @param {Array<Object>} buttons
     * @param {Object} [options]
     */
    dialog: function (content, title, buttons, options) {

        var dialog = document.createElement('dialog');
        dialog.className = ['daDialog', 'fixed'].join(' ');

        if (title !== undefined && title !== null) {
            var header = document.createElement('header');
            var heading = document.createElement('h3');
            heading.innerText = title;
            header.appendChild(heading);
            dialog.appendChild(header);
        }

        dialog.appendChild(content);

        var footer = document.createElement('footer');

        var btn, spacer;
        for (var i = 0; i < buttons.length; i++) {
            btn = document.createElement('button');
            btn.className = ['smbutton', 'smbutton-' + buttons[i].color, 'smbutton-size-large', 'smbutton-shadow'].join(' ');
            btn.innerText = buttons[i].text;

            if (buttons[i].value !== undefined && buttons[i].value !== null) {
                btn.setAttribute('return-value', buttons[i].value);
            }

            btn.addEventListener('click', function (event) {
                dialog.close(event.target.getAttribute('return-value'));
            });

            if (i > 0) {
                spacer = document.createElement('span');
                spacer.innerText = ' ';
                footer.appendChild(spacer);
            }

            footer.appendChild(btn);
        }

        dialog.appendChild(footer);


        if (options !== undefined && options !== null) {
            if (options.callbacks !== undefined && options.callbacks !== null) {

                if (typeof options.callbacks.close === 'function') {
                    dialog.addEventListener('close', function () {
                        var returnValue = this.returnValue;
                        if (options.callbackReturnType !== undefined && options.callbackReturnType !== null) {
                            returnValue = returnValue.cast(options.callbackReturnType);
                        }
                        options.callbacks.close(returnValue);
                    });
                }

                if (typeof options.callbacks.cancel === 'function') {
                    dialog.addEventListener('cancel', function () {
                        options.callbacks.cancel();
                    });
                }

            }
        }

        // destroy the dialog on close
        dialog.addEventListener('close', function () {
            if (dialog && dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        });

        document.body.appendChild(dialog);

        if (typeof dialogPolyfill !== 'undefined') {
            dialogPolyfill.registerDialog(dialog);
        }

        dialog.showModal();

        return dialog;
    },

    /**
     * Basic alert() replacement modal using HTML5 dialog element and polyfill
     * @param {String} text
     * @param {String} [title]
     */
    alert: function (text, title) {
        var content = document.createElement('p');
        content.innerText = text;

        var buttons = [
            {
                text: 'OK',
                color: 'lightgreen'
            }
        ]

        return daDialog.dialog(content, title, buttons);
    },

    /**
     * Basic confirm() replacement modal using HTML5 dialog element and polyfill
     * @param {String} text
     * @param {String} [title]
     * @param {Function} callback
     */
    confirm: function (text, title, callback) {
        var content = document.createElement('p');
        content.innerText = text;

        var buttons = [
            {
                text: 'Yes',
                color: 'lightgreen',
                value: true
            },
            {
                text: 'No',
                color: 'lightgreen',
                value: false
            }
        ]

        var options = {
            callbackReturnType: 'boolean',
            callbacks: {
                close: callback
            }
        };

        return daDialog.dialog(content, title, buttons, options);
    }
}
