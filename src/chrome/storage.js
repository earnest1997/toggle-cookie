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

  set(key, value,isSync) {
    return new Promise((resolve) => {
      const storageType=isSync ? 'sync':'local'
      chrome.storage[storageType].set({ [`${this.siteDomain}-${key}`]: value }, () => {
        console.log(`${this.siteDomain}-${key}`, 'set',value);
        resolve(value);
      });
    });
  }

  get(key,isSync) {
    return new Promise((resolve) => {
      const storageType=isSync ? 'sync':'local'
      chrome.storage[storageType].get(`${this.siteDomain}-${key}`, (result) => {
        console.log(`${this.siteDomain}-${key}`, 'get');
        resolve(result[`${this.siteDomain}-${key}`] || {});
      });
    });
  }
})();
