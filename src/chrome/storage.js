/* eslint-disable no-undef */
import { getPageInfo } from './page';

export const storage = new (class Storage {
  constructor() {
    this.siteDomain = '';
    this.init();
  }

  async init() {
    const { search } = new URL(window.location.href);
    const isDomainInUrl = search.match(/(?<=(domain=))(.*)/);
    if (isDomainInUrl) {
      this.siteDomain = search.match(/(?<=(domain=))(.*)/)[0];
    } else {
      const { domain } = await getPageInfo();
      this.siteDomain = domain;
    }
  }

  set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [`${this.siteDomain}-${key}`]: value }, () => {
        console.log(`${this.siteDomain}-${key}`, 'get');
        resolve(value);
      });
    });
  }

  get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(`${this.siteDomain}-${key}`, (result) => {
        console.log(`${this.siteDomain}-${key}`, 'get');
        resolve(result[`${this.siteDomain}-${key}`] || {});
      });
    });
  }
})();
