import {parse_url} from '../helpers.js';

/**
 * @version 0.1.0
 */
export default class HRequest {
    /**
     * @constructor
     */
    constructor() {
        this.port = Number(location.port || 80);
        this.host = location.hostname;
        this.params = {};
        this.search = this.getQuerySearch();
        this.agent = navigator.userAgent;
    }

    /**
     * @return {object}
     */
    getQuerySearch() {
        let search = decodeURI(location.search), params = {};
        if (search.startsWith('?', 0)) {
            search = search.substring(1);
        }
        search.split('&', q => {
            let split = q.split('=');
            params[split[0]] = split[1];
        });
        return params;
    }

    /**
     * @return {boolean}
     */
    isHTTP() {
        return location.protocol.replace(':') === 'http';
    }

    /**
     * @return {boolean}
     */
    isHTTPS() {
        return location.protocol.replace(':') === 'https';
    }

    /**
     * @return {string}
     */
    get url() {
        return location.href;
    }

    get hash() {
        const url = parse_url(location.hash.substr(1) || '/');
        return url.pathname;
    }
}