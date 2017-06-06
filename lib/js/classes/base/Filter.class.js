/**
 * Base object for deviantART filters (sort of a wrapper for FilterObjects and FilterLists)
 */
class Filter {

    /**
     * Constructor
     * @param {String} label
     * @param {FilterList} list
     */
    constructor(label, list) {
        this.label = label;
        this.list = list;
    }

    /**
     * Creates a new FilterObject with the supplied properties
     * @param {Object} properties
     * @return {FilterObject}
     */
    create(properties) {
        return new FilterObject('');
    }

    /**
     * Inserts DOM controls specific to the FilterList
     */
    insertDOMControls() {
        throw 'Not Implemented';
    }

    /**
     * Updates the DOM after changes are made to the list of FilterObjects
     */
    apply() {
        console.group(this.label + '.apply()');

        this.showAll();
        this.hideAll();

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Hides all FilterObjects on the FilterList
     */
    hideAll() {
        throw 'Not Implemented';
    }

    /**
     * Shows all FilterObjects on the FilterList
     */
    showAll() {
        throw 'Not Implemented';
    }

    /**
     * Builds the table for managing the FilterList
     */
    getTable() {
        throw 'Not Implemented';
    }

    /**
     * Click event handler for the Clean Filter button
     * @param {Event} event
     */
    //@TODO the corresponding table (in the modal) needs to be refreshed/rebuilt (only if changes were made)
    cleanFilterListClickEventHandler(event) {
        console.group(this.label + '.cleanFilterListClickEventHandler()');

        event.preventDefault();

        this.list.clean();
        alertModal('Your Filtered ' + this.label + ' have been cleaned successfully.')

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Click event handler for the Reset Filter button
     * @param {Event} event
     */
    //@TODO the corresponding table (in the modal) needs to be refreshed/rebuilt
    resetFilterListClickEventHandler(event) {
        console.group(this.label + '.resetFilterListClickEventHandler()');

        event.preventDefault();

        if (confirm('Are you sure you want to reset your Hidden ' + this.label + '?')) {
            this.list.reset();
            alertModal('All of your Filtered ' + this.label + ' have been reset successfully.')
        }

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Determines if the specified FilterObject is currently hidden
     * @param {FilterObject} filterObject
     * @return {Boolean}
     */
    isHidden(filterObject) {
        console.group(this.label + '.isHidden()');

        var idx = this.list.find(filterObject);
        var result = (idx >= 0);

        console.log('Return', result);
        console.log('Complete');
        console.groupEnd();

        return result;
    }

    /**
     * Hides the specified FilterObject
     * @param {FilterObject} filterObject
     * @return {Boolean}
     */
    hide(filterObject) {
        console.group(this.label + '.hide()');

        var result = this.list.add(filterObject);
        this.apply();

        console.log('Return', result);
        console.log('Complete');
        console.groupEnd();

        return result;
    }

    /**
     * Shows the specified FilterObject
     * @param {FilterObject} filterObject
     * @return {Boolean}
     */
    show(filterObject) {
        console.group(this.label + '.hide()');

        var result = this.list.remove(filterObject);
        this.apply();

        console.log('Return', result);
        console.log('Complete');
        console.groupEnd();

        return result;
    }

    /**
     * Toggles the specified FilterObject
     * @param {FilterObject} filterObject
     * @return {Boolean}
     */
    toggle(filterObject) {
        console.group(this.label + '.hide()');

        var result = this.list.toggle(filterObject);
        this.apply();

        console.log('Return', result);
        console.log('Complete');
        console.groupEnd();

        return result;
    }
}
