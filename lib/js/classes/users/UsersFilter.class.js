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
     * @return {FilterObject}
     */
    create(properties) {
        return new UserObject(properties.username);
    }

    /**
     * Inserts DOM controls for hiding users
     */
    insertDOMControls() {
        console.group(this.label + '.insertDOMControls()');

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
                console.log('Added control', control);
            }
        });

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Click event handler for toggler on deviations
     * @param {Event} event
     */
    toggleUserDeviationClickHandler(event) {
        console.group(this.label + '.toggleUserDeviationClickHandler()');

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var target = $(event.target);
        var username = target.attr('username');

        var user = this.create({ username: username });

        this.toggle(user);

        console.log('Complete');
        console.groupEnd();

        return false;
    }

    /**
     * Hides all hidden users via CSS
     */
    hideAll() {
        console.group(this.label + '.hideAll()');

        var selector = '.torpedo-container .thumb';
        var invisibleCSS = 'display: none !important;';
        var placeholderCSS = 'position: absolute; left: 0; top: 0; height: 100%; width: 100%; content: " "; background: #DDE6DA url("http://st.deviantart.net/misc/noentry-green.png") no-repeat center center; display: block; z-index: 10;';

        if (this.list.data.length > 0) {
            console.log("Hiding " + this.list.data.length + " FilterObject(s) via CSS");

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

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Shows all hidden users by removing the CSS
     */
    showAll() {
        console.group(this.label + '.showAll()');

        if (this._sheet != null) {
            resetStyleSheet(this._sheet);
        }

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Builds the table for managing users
     * @return {Element}
     */
    getTable() {
        console.group(this.label + '.getTable()');

        this.list.clean(false);

        console.log('Building table for users:', this.list.data);

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

        console.log('Return', table);
        console.log('Complete');
        console.groupEnd();

        return table;
    }

    /**
     * Click event handler for the Hide User button on the management table
     * @param {Event} event
     */
    hideButtonClickHandler(event) {
        console.group(this.label + '.hideButtonClickHandler()');

        var username = $('input#username').val();

        if (username === '' || username === null) {
            alertModal('You must provide a Username.');
            return false;
        }

        var user = this.create({ username: username });

        if (this.hide(user)) {
            $('#manage-users-table').replaceWith(this.getTable());
        }

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Click event handler for the Show User button on the management table
     * @param {Event} event
     */
    showButtonClickHandler(event) {
        console.group(this.label + '.showButtonClickHandler()');

        var target = $(event.target);
        var username = target.attr('username');

        var user = this.create({ username: username });

        if (this.show(user)) {
            $('#manage-users-table').replaceWith(this.getTable());
        }

        console.log('Complete');
        console.groupEnd();
    }
}
