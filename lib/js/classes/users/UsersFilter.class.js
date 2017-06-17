/**
 * Users (a.k.a. deviants) Filter
 * @extends Filter
 */
class UsersFilter extends Filter {

    /**
     * Constructor
     */
    constructor() {
        super('Users', new UserList());
    }

    /**
     * Creates a new FilterObject with the supplied properties
     * @param {Object} properties
     * @returns {FilterObject}
     */
    create(properties) {
        return new UserObject(properties.username);
    }

    /**
     * Inserts DOM controls for hiding users
     */
    insertDOMControls() {
        console.log(this.label + '.insertDOMControls()');

        var self = this;

        $('.torpedo-container').on('mouseover', 'span.thumb', function () {
            var regex = /^https?:\/\/([^\.]+)\.deviantart\.com/i;
            var match;

            var thumb = $(this);
            var control = $('span.hide-user-corner', thumb);
            if (!control.length) {
                match = regex.exec(thumb.attr('href'));
                control = $('<span/>').addClass('hide-user-corner');
                control.attr('username', match[1]);
                control.on('click', $.proxy(self.toggleUserDeviationClickHandler, self));
                thumb.find('a.torpedo-thumb-link').append(control);
                console.log(self.label + '.insertDOMControls() :: Added control', control);
            }
        });

        console.log(this.label + '.insertDOMControls() :: Complete');
    }

    /**
     * Click event handler for toggler on deviations
     * @param {Event} event
     */
    toggleUserDeviationClickHandler(event) {
        console.log(this.label + '.toggleUserDeviationClickHandler()');

        event.preventDefault();
        event.stopPropagation();

        var target = $(event.target);
        var username = target.attr('username');

        var user = this.create({ username: username });

        this.toggle(user);

        console.log(this.label + '.toggleUserDeviationClickHandler() :: Complete');
    }

    /**
     * Hides all hidden users via CSS
     */
    hideAll() {
        console.log(this.label + '.hideAll()');

        var selector = '.torpedo-container .thumb';
        var invisibleCSS = 'display: none !important;';
        var placeholderCSS = 'position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url("data:image/png;base64,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") no-repeat center center; display: block; z-index: 10;';

        if (this.list.data.length > 0) {
            console.log(this.label + '.hideAll() :: Hiding ' + this.list.data.length + ' FilterObject(s) via CSS');

            if (this._sheet == null) {
                this._sheet = addStyleSheet();
            }

            for (var i = 0; i < this.list.data.length; i++) {
                if (typeof this.list.data[i].username !== 'undefined' && this.list.data[i].username !== null) {
                    this._sheet.insertRule('body.no-placeholders ' + selector + '[href*="//' + this.list.data[i].username + '.deviantart.com"] { ' + invisibleCSS + ' }', 0);
                    this._sheet.insertRule('body.placeholders ' + selector + ' a.torpedo-thumb-link[href*="//' + this.list.data[i].username + '.deviantart.com"]::before { ' + placeholderCSS + ' }', 0);
                }
            }
        }

        console.log(this.label + '.hideAll() :: Complete');
    }

    /**
     * Shows all hidden users by removing the CSS
     */
    showAll() {
        console.log(this.label + '.showAll()');

        if (this._sheet != null) {
            resetStyleSheet(this._sheet);
        }

        console.log(this.label + '.showAll() :: Complete');
    }

    /**
     * Builds the table for managing users
     * @returns {Element}
     */
    getTable() {
        console.log(this.label + '.getTable()');

        this.list.clean(false);

        console.log(this.label + '.getTable() :: Building table for users', this.list.data);

        var table = $('<table/>')
            .addClass('manage-filters-table')
            .attr('id', 'manage-users-table')
            .append('<tr><th>Username</th><th>Action</th></tr>');

        var row = $('<tr/>');

        var usernameField = $('<input/>')
            .attr('id', 'username')
            .attr('name', 'username')
            .attr('placeholder', 'Username')
            .attr('type', 'text')
            .wrap('<td/>').parent()
            .appendTo(row);

        var hideButton = $('<button/>')
            .addClass('smbutton smbutton-red smbutton-shadow')
            .attr('id', 'hide-user-button')
            .html('Hide User')
            .on('click', $.proxy(this.hideButtonClickHandler, this))
            .wrap('<td/>').parent()
            .appendTo(row);

        table.append(row);

        for (var i = 0; i < this.list.data.length; i++) {
            row = $('<tr/>');

            // username column w/ link
            if (typeof this.list.data[i].username !== 'undefined' && this.list.data[i].username !== null) {
                row.append('<td><a class="external" href="http://' + this.list.data[i].username + '.deviantart.com/" target="_blank">' + this.list.data[i].username + '</a></td>');
            } else {
                row.append('<td>---</td>');
            }

            // show user column w/ button
            var showButton = $('<button/>')
                .addClass('smbutton smbutton-green smbutton-shadow')
                .attr('username', this.list.data[i].username)
                .html('Unhide User')
                .on('click', $.proxy(this.showButtonClickHandler, this))
                .wrap('<td/>').parent()
                .appendTo(row);

            table.append(row);
        }

        console.log(this.label + '.getTable() :: Return', table);
        return table;
    }

    /**
     * Click event handler for the Hide User button on the management table
     * @param {Event} event
     */
    hideButtonClickHandler(event) {
        console.log(this.label + '.hideButtonClickHandler()');

        var username = $('input#username').val();

        if (username === '' || username === null) {
            daDialog.alert('You must provide a Username.');
            return false;
        }

        var user = this.create({ username: username });

        if (this.hide(user)) {
            $('#manage-users-table').replaceWith(this.getTable());
        }

        console.log(this.label + '.hideButtonClickHandler() :: Complete');
    }

    /**
     * Click event handler for the Show User button on the management table
     * @param {Event} event
     */
    showButtonClickHandler(event) {
        console.log(this.label + '.showButtonClickHandler()');

        var target = $(event.target);
        var username = target.attr('username');

        var user = this.create({ username: username });

        if (this.show(user)) {
            $('#manage-users-table').replaceWith(this.getTable());
        }

        console.log(this.label + '.showButtonClickHandler() :: Complete');
    }
}
