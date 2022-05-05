/* eslint-disable no-undef */
import { getPageInfo } from './page';

export const storage = new (class Storage {
    constructor() {
        this.siteDomain = '';
        this.init();
    }

    async init() {
        const { domain } = await getPageInfo();
        this.siteDomain = domain;
    }

    set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [`${this.siteDomain}-${key}`]: value }, () => {
                resolve(value);
            });
        });
    }

    get(key) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(`${this.siteDomain}-${key}`, (result) => {
                resolve(result[`${this.siteDomain}-${key}`] || {});
            });
        });
    }
})();
