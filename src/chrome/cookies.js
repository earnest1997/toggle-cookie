import * as storage from './storage';
import { parentClient } from './message';

function getCookie() {
    return new Promise((resolve) => {
        chrome.cookies.getAll({ domain: document.domain }, (cookies) => {
            resolve(cookies);
        });
    });
}

function setCookie(val) {
    chrome.cookies.set(val);
}

function removeCookie() {
    chrome.cookies.remove();
}

async function addData(name, val = true, key = 'users') {
    const users = await storage.get(key) || {};
    users[name] = val;
    storage.set(key, users);
}

async function removeData(name, key = 'users') {
    const users = await storage.get(key) || {};
    delete users[name];
    storage.set(key, users);
}

async function toggleUser(name) {
    const cookies = await storage.get('user') || {};
    const cookie = cookies[name];
    cookie.forEach((item) => {
        const { domain } = item;
        const isParentDomain = domain !== document.domain;
        if (!isParentDomain) {
            setCookie(item);
        } else {
            parentClient.sendMessage('set-cookie', item);
        }
    });
}

export {
    getCookie,
    setCookie,
    removeCookie,
    addData,
    removeData,
    toggleUser
};
