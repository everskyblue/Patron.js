import { vw_error, vw_args, kw_find } from "./error.js";

/**
 * @typedef {object} ScopeType
 * @property {string} called nombre de la propiedad que es llamada
 * @property {boolean} local dato definido por global o del template llamado
 */

/**
 * @typedef {object} EvaluatorType
 * @property {string} type
 * @property {ScopeType} scope
 * @property {string|object} evaluate
 */

/**
 * @typedef {object} CompilerDirective
 * @property {HTMLElement} node nombre de la propiedad que es llamada
 * @property {Set.<EvaluatorType>} directives dato definido por global o del template llamado
 */

export let todo = [];

 /** ayuda a prevenir a iterar el mismo nodo al usar la directiva @for */
getStructList.ignoreChild = false;

/**
 * 
 * @param {NodeListOf} childs
 * @return {Array.<CompilerDirective>}
 */
export function getStructList(childs) {
    const arr = [];
    childs.forEach(child => {
        if (child.attributes) {
            arr.push({
                d: createSetToCompile(child),
                c: (() => {
                    if (getStructList.ignoreChild) {
                        getStructList.ignoreChild = false;
                        return [];
                    }
                    return getStructList(child.childNodes);
                })()
            });
        }
    });
    todo = todo.concat(arr);
    return arr;
}

/**
 * @since 0.3.0
 * @param {string} $var 
 * @return {ScopeType}
 */
export function scopeCode($var) {
    let scope = {called: $var, local: false}; 
    if ($var.charAt(0) === '{') {
        scope = {called: $var.replace(/[\{|\}]/g, ''), local: true};
    }
    return scope;
}


/**
 * @version 0.3.0
 * @since 0.3.1
 * @param {HTMLElement} node de entrada
 * @return {CompilerDirective}
 */
export function createSetToCompile(node) {
    let set = new Set();

    for (let index = 0, attrs = Object.values(node.attributes), attr; index < attrs.length; index++) {
        attr = attrs[index];
        if (attr.name === '@if') {
            set.add({
                type: 'if',
                scope: scopeCode(attr.value)
            });
        }

        if (attr.name === '@for') {
            const c3 = attr.value.split(' ');
            // numero de argumentos validos
            vw_error(vw_args(c3, 3), 'num args not match');
            // retorna el tipo de itaracion de valor deseado. en caso de error genera una excepcion
            const kwd = kw_find('of', 1, c3) ? 'of' : kw_find('in', 1, c3) ? 'in' : vw_error(true, 'syntax error');
            
            set.add({
                type: 'for',
                scope: scopeCode(c3[2]),
                evaluate: {
                    keyword: kwd,
                    name_var: c3[0],
                }
            });
        }
    
        if (attr.name === ':bind') {
            const split_key = attr.value.split('.'),
                    scope = scopeCode(split_key.shift());

            set.add({
                scope,
                type: 'bind',
                evaluate: split_key
            });
        }

        if (/\@event\:(.*)$/.test(attr.name)) {
            set.add({
                type: 'event',
                scope: scopeCode(attr.value),
                evaluate: attr.name.split(':').filter(e => !(e[0]==='@'))
            });
        }
    }

    return {
        node,
        directives: set
    };
}