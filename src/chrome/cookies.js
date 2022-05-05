import { storage } from './storage';
import { parentClient, ChromeMessage } from './message';

function getCookie(url) {
    return new Promise((resolve) => {
        chrome.cookies.getAll({ url }, (cookies) => {
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

async function addData(name, val = true, key = 'users') {
    const users = await storage.get(key) || {};
    users[name] = val;
    console.log(name, val, 999);
    storage.set(key, users);
}

async function removeData(name, key = 'users') {
    const users = await storage.get(key) || {};
    delete users[name];
    storage.set(key, users);
}

async function toggleUser({ name, domain: currentPageDomain, url }) {
    const data = await storage.get('users') || {};
    const detail = data[name];
    const cookie = detail.cookie || [];
    const parentCookie = [];
    cookie.forEach(({ hostOnly, session, ...item }) => {
        const { domain } = item;
        item.url = url;
        const isParentDomain = domain !== currentPageDomain;
        if (isParentDomain) {
            setCookie(item);
        } else {
            parentCookie.push(item);
        }
    });
    if (parentCookie.length) {
        parentClient.sendMessage(new ChromeMessage('set-parent-cookie', parentCookie));
    }
}

export {
    getCookie,
    setCookie,
    removeCookie,
    addData,
    removeData,
    toggleUser
};
