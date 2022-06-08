import { storage } from './storage';
import { parentClient, ChromeMessage } from './message';

function getCookie(url) {
    return new Promise((resolve) => {
        chrome.cookies.getAll({ url }, (cookies) => {
            console.log(url, cookies, 9999);
            resolve(cookies);
        });
    });
}

function setCookie(val) {
    chrome.cookies.set(val, () => {
        console.log('set cookie error', chrome.extension.lastError);
        console.log(chrome.runtime.lastError);
    });
}

function removeCookie() {
    chrome.cookies.remove();
}

async function setData(name, val = true, key = 'users') {
    const data = await storage.get(key) || {};
    data[name] = { ...(data[name] || {}), ...val };
    storage.set(key, data);
}

async function removeData(name, key = 'users') {
    const data = await storage.get(key) || {};
    delete data[name];
    storage.set(key, data);
}

async function toggleUser({ name, domain: currentPageDomain, url }) {
    const data = await storage.get('users') || {};
    const detail = data[name];
    const cookie = detail.cookie || [];
    const parentCookie = [];
    storage.set('activeUser', name);
    cookie.forEach(({ hostOnly, session, ...item }) => {
        const { domain, name } = item;
        item.url = url;
        chrome.cookies.remove({ url, name });
        const isParentDomain = domain !== currentPageDomain;
        if (!isParentDomain) {
            setCookie(item);
        } else {
            parentCookie.push(item);
        }
    });
    console.log(parentCookie, 99, currentPageDomain, cookie);
    if (parentCookie.length) {
        parentClient.sendMessage(new ChromeMessage('set-parent-cookie', parentCookie));
    }
}

export {
    getCookie,
    setCookie,
    removeCookie,
    setData,
    removeData,
    toggleUser
};
