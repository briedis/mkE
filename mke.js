'use strict';

/**
 * Construct an mkE element
 * @param {mkE.Par} par
 * @returns {*}
 */
function mkE(par) {
    if (!par.tag && typeof par.text != 'string') {
        return false;
    }

    if (par.tag) {
        par.prop = par.prop || {};

        switch (par.tag) {
            case 'img':
                if (par.src) {
                    par.prop.src = par.src;
                }
                break;
            case 'a':
                par.prop.href = par.prop.href || par.href || 'javascript:';
                if (par.target) {
                    par.prop.target = par.target;
                }
                break;
            case 'select':
                if (typeof par.value != 'undefined') {
                    par.prop.value = par.value;
                }
                if (par.name) {
                    par.prop.name = par.name;
                }
                break;
            case 'option':
                if (par.value) {
                    par.prop.value = par.value;
                }
                break;
            case 'input':
                if (par.value) {
                    par.prop.value = par.value;
                }
                if (par.type) {
                    par.prop.type = par.type;
                }
                if (par.name) {
                    par.prop.name = par.name;
                }
                if (par.checked) {
                    par.prop.checked = par.checked;
                }
                if (par.type && par.type == 'checkbox' && par.prop.checked) {
                    par.prop.defaultChecked = par.prop.checked;
                }
                break;
            case 'textarea':
                if (par.value) {
                    par.prop.value = par.value;
                }
                break;
            case 'iframe':
                if (par.src) {
                    par.prop.src = par.src;
                }
                break;
        }

        if (par.id) {
            par.prop.id = par.id;
        }

        if (par.className) {
            par.prop.className = par.className;
        }

        if (par.style) {
            par.prop.style = par.style;
        }

        if (par.onclick) {
            par.prop.onclick = par.onclick;
        }

        if (par.innerHTML) {
            par.prop.innerHTML = par.innerHTML;
        }

        var _tag = par.tag;
        var elm;

        if (par.tag == _tag) {
            elm = document.createElement(par.tag);
        } else {
            try {
                elm = document.createElement(par.tag);
            } catch (e) {
                elm = document.createElement(_tag);
            }
        }

        if (par.attr) {
            for (var key in par.attr) {
                elm.setAttribute(key, par.attr[key]);
            }
        }

        if (par.els && typeof par.els == 'object') {
            var r;
            for (var ii in par.els) {
                r = par.els[ii];
                switch (typeof r) {
                    case 'number':
                        elm.appendChild(document.createTextNode(String(r)));
                        continue;
                    case 'string':
                        elm.appendChild(document.createTextNode(r));
                        continue;
                    case 'object':
                        if (!r.nodeType && r.tag) {
                            r = mkE(r);
                            break;
                        }
                        if (r instanceof Array) {
                            for (var i = 0; i < r.length; ++i) {
                                mkE._appendTypeElement(elm, r[i]);
                            }
                            continue;
                        }
                        break;
                    case 'boolean':
                        continue;
                    case 'undefined':
                        if (console && console.error) {
                            console.error('mkE: undefined child', par);
                        }
                        continue;
                }
                if (r.append) {
                    r.append(elm);
                } else {
                    elm.appendChild(r);
                }
            }
        }
        if (par.els && typeof par.els == 'string') {
            par.innerHTML = par.els;
        }

        mkE.O2O(elm, par.prop);

        if (typeof par.text !== 'undefined') {
            elm.appendChild(document.createTextNode(par.text));
        }

        elm.append = mkE.append;
        elm.appendTo = mkE.appendTo;
        elm.prepend = mkE.prepend;
        elm.remove = mkE.remove;
        elm.replace = mkE.replace;
    } else {
        elm = document.createTextNode(par.text);
    }

    return elm;
}

mkE.append = function (node) {
    if (typeof node == 'string') {
        node = document.getElementById(node);
    }
    node.appendChild(this);
    return this;
};

mkE.prepend = function (node) {
    if (node.firstChild) {
        mkE.insertBefore(this, node.firstChild);
        return this;
    }
    node.appendChild(this);
    return this;
};

mkE.remove = function () {
    mkE.removeNode(this);
    return this;
};

mkE.clear = function () {
    mkE.clearNode(this);
    return this;
};

mkE._appendTypeElement = function (elm, r) {
    switch (typeof r) {
        case 'number':
            elm.appendChild(document.createTextNode(String(r)));
            return;
        case 'string':
            elm.appendChild(document.createTextNode(r));
            return;
        case 'object':
            if (!r.nodeType && r.tag) {
                r = mkE(r);
                break;
            }
            if (r instanceof Array) {
                for (var i = 0; i < r.length; ++i) {
                    mkE._appendTypeElement(elm, r[i]);
                }
                return;
            }
            break;
        case 'boolean':
            return;
        case 'undefined':
            if (console && console.error) {
                console.error('mkE: undefined child', par);
            }
            return;
    }
    if (r.append) {
        r.append(elm);
    } else {
        elm.appendChild(r);
    }
};

mkE.appendTo = function (parent, jquery) {
    if (typeof jquery === 'undefined') {
        jquery = true;
    }
    if (typeof parent == 'string') {
        if (jquery) {
            parent = $(parent)[0];
        } else {
            parent = document.getElementById(parent);
        }
    }
    if (parent instanceof Array) {
        parent = mkE.reset(parent);
    }
    parent.appendChild(this);
    return this;
};

mkE.replace = function (node) {
    if (!node.parentNode) {
        return this;
    }
    mkE.insertBefore(this, node);
    mkE.removeNode(node);
    return this;
};

mkE.removeNode = function (node) {
    if (node.parentNode && node.parentNode.tagName) {
        return node.parentNode.removeChild(node);
    }
    return false;
};

mkE.clearNode = function (node) {
    var n;
    while (n = node.firstChild) {
        if (n.remove) {
            n.remove();
            continue;
        }
        mkE.removeNode(n);
    }
    return node;
};

mkE.O2O = function (target, source) {
    if (typeof( target ) == 'undefined' || typeof( source ) == 'undefined') {
        return;
    }
    for (var key in source) {
        var sourceValue = source[key];
        if (typeof sourceValue == 'undefined') {
            if (console && console.error) {
                console.error('mkE O2O undefined key', source, key);
            }
        }
        if (sourceValue && sourceValue.constructor == Object) {
            if (!target[key]) {
                target[key] = {};
            }
            mkE.O2O(target[key], sourceValue);
        } else {
            try {
                target[key] = sourceValue;
            } catch (e) {
                // Somethings bad
            }
        }
    }
};

/**
 * Get first value of an array
 * @param {Array} v
 * @returns {*}
 */
mkE.reset = function (v) {
    for (var k in v) {
        return v[k];
    }
    return null;
};

mkE.insertBefore = function (el, before) {
    before.parentNode.insertBefore(el, before);
};

/**
 * Constructor for documentation, not for using
 * @constructor
 */
mkE.Par = function () {
};
mkE.Par.prototype.tag = '';
mkE.Par.prototype.text = '';
mkE.Par.prototype.prop = {};
mkE.Par.prototype.target = '';
mkE.Par.prototype.href = '';
mkE.Par.prototype.value = '';
mkE.Par.prototype.name = '';
mkE.Par.prototype.type = '';
mkE.Par.prototype.checked = false;
mkE.Par.prototype.src = '';
mkE.Par.prototype.attr = {};
mkE.Par.prototype.id = '';
mkE.Par.prototype.className = '';
mkE.Par.prototype.style = '';
mkE.Par.prototype.innerHTML = '';
mkE.Par.prototype.onclick = null;
mkE.Par.prototype.els = [];
