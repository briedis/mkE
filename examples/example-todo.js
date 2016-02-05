(function (window) {
    'use strict';

    /**
     * Main component
     * @constructor
     */
    var Todo = function () {
        this.items = [];

        this.buttonSave = mkE({
            tag: 'a',
            text: 'Save',
            className: 'btn btn-warning',
            style: {
                marginLeft: '10px'
            },
            onclick: mkE.closure(this.saveItems, this)
        });

        this.node = mkE({
            tag: 'div',
            els: [
                this.nodeItems = mkE({
                    tag: 'div',
                    els: []
                }),
                {
                    tag: 'a',
                    className: 'btn btn-primary',
                    text: 'Add',
                    prop: {
                        onclick: mkE.closure(this.addItem, this, '', false)
                    }
                },
                this.buttonSave
            ]
        });

        this.loadItems();
        this.updateListState();
    };

    Todo.prototype = new mkE.Base;

    /**
     * Keep references for items
     * @type {Array<TodoItem>} items
     */
    Todo.prototype.items = null;

    /**
     * Add new item at the bottom of list
     * @param {string} [text]
     * @param {boolean} [isDone]
     */
    Todo.prototype.addItem = function (text, isDone) {
        if (this.items.length == 0) {
            // Clear the empty message
            mkE.clearNode(this.nodeItems);
        }

        var item = new TodoItem({
            onRemoveCallback: mkE.closure(this.onRemove, this),
            text: text,
            isDone: isDone
        });

        item.append(this.nodeItems);
        this.items.push(item);

        item.setFocus();
    };

    /**
     * When item was removed, this is called
     * @param {TodoItem} item
     */
    Todo.prototype.onRemove = function (item) {
        this.items.splice(this.items.indexOf(item), 1);
        this.updateListState();
    };

    Todo.prototype.updateListState = function () {
        if (!this.items.length) {
            mkE.clearNode(this.nodeItems);
            mkE({
                tag: 'i',
                text: 'No items in list'
            }).append(this.nodeItems);
        }
    };

    /**
     * Save items in local storage
     */
    Todo.prototype.saveItems = function () {
        var itemsPrepared = [];

        this.items.forEach(function (item) {
            itemsPrepared.push({
                text: item.getText(),
                isDone: item.isDone()
            });
        });

        this.buttonSave.innerHTML = 'Saved!';
        setTimeout(mkE.closure(function () {
            this.buttonSave.innerHTML = 'Save';
        }, this), 2000);

        localStorage.setItem('todoListData', JSON.stringify(itemsPrepared));
    };

    /**
     * Load saved items from local storage
     */
    Todo.prototype.loadItems = function () {
        var itemsJSON = localStorage.getItem('todoListData');
        if (!itemsJSON) {
            return;
        }
        var items = JSON.parse(itemsJSON);
        items.forEach(function (itemData) {
            this.addItem(itemData.text, itemData.isDone)
        }, this);
    };

    // ------------------- TodoItem ------------------- //

    /**
     *
     * @param par Parameters
     * @param {function} [par.onRemoveCallback] Optional Callback which is called when user wants to remove the item
     * @param {string} [par.text]
     * @param {boolean} [par.isDone]
     * @constructor
     * @extends mkE.Base
     */
    var TodoItem = function (par) {
        this.par = par || {};

        this.input = mkE({
            tag: 'input',
            type: 'text',
            className: 'form-control',
            value: par.text || '',
            attr: {
                placeholder: 'Enter text…'
            }
        });

        this.checkbox = mkE({
            tag: 'input',
            type: 'checkbox'
        });

        this.checkbox.checked = !!par.isDone;

        this.node = mkE({
            tag: 'div',
            className: 'form-inline',
            style: {
                marginBottom: '20px'
            },
            els: [
                {
                    tag: 'div',
                    className: 'checkbox',
                    els: [
                        {
                            tag: 'label',
                            els: [
                                this.checkbox,
                                ' Done'
                            ]
                        }
                    ]
                },
                ' ',
                {
                    tag: 'div',
                    className: 'form-group',
                    els: [
                        this.input
                    ]
                },
                ' ',
                {
                    tag: 'a',
                    className: 'btn btn-default',
                    onclick: mkE.closure(this.onRemove, this),
                    prop: {
                        innerHTML: 'Remove'
                    }
                }
            ]
        });
    };

    TodoItem.prototype = new mkE.Base;

    /**
     * Set browser focus on input
     */
    TodoItem.prototype.setFocus = function () {
        this.input.focus();
    };

    /**
     * Remove from DOM and notify with callback
     */
    TodoItem.prototype.onRemove = function () {
        this.remove();

        if (this.par.onRemoveCallback) {
            this.par.onRemoveCallback(this);
        }
    };

    /**
     * Is this item marked as done
     * @returns {boolean}
     */
    TodoItem.prototype.isDone = function () {
        return this.checkbox.checked;
    };

    /**
     * Get text entered
     * @returns {string}
     */
    TodoItem.prototype.getText = function () {
        return this.input.value;
    };

    window.Todo = Todo;
    window.TodoItem = TodoItem;

})(window);