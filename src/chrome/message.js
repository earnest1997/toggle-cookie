/* eslint-disable no-undef */
// 统一消息格式
class ChromeMessage {
    constructor(msg, params) {
        this.msg = msg;
        this.params = params;
    }
}

// 监听回调函数
const listeners = {};

// 事件分发
function dispatchEvent(request, sendResponse) {
    const { msg } = request;
    let callBack;

    Object.keys(listeners).forEach((key) => {
        if (key === msg) {
            callBack = listeners[key];
        }
    });

    if (callBack) {
        const paramSize = callBack.length;

        callBack(request, sendResponse);

        return paramSize === 2;
    }

    return false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const success = dispatchEvent(request, sendResponse);

    if (!success) {
        sendResponse(new ChromeMessage('Default Response'));
    }

    return true;
});

// content scripts 发送和监听消息
class ContentClient {
    listen(msg, callBack) {
        listeners[msg] = callBack;
    }

    seedMessage(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (res) => {
                resolve(res);
            });
        });
    }
}

// background 或者 popup发送和监听消息
class ParentClient {
    listen(msg, callBack) {
        listeners[msg] = callBack;
    }

    seedMessage(message) {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    resolve(response);
                });
            });
        });
    }
}

const contentClient = new ContentClient();
const parentClient = new ParentClient();

export { contentClient, parentClient, ChromeMessage };
