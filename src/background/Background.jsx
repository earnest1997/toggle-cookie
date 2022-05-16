import {
    parentClient, ChromeMessage, contentClient, storage, create
} from '../chrome';

export default class Background {
    constructor() {
        this.init();
    }

    init() {
        this.listenSetCookieCmd();
        this.listenPing();
        this.listenSetPersonalPermissionCmd();
        this.initContentMenu();
        this.initMessageClient();
    }

    getWindow() {
        return chrome.windows.getCurrent;
    }

    async listenSetCookieCmd() {
        contentClient.listen('set-cookie', async (res, sendResponse) => {
            // currentWindow.currentUserCookie = res.params;
            await storage.set('currentUserCookie', res.params, true);
            sendResponse(new ChromeMessage('set cookie success'));
        });
    }

    listenPing() {
        parentClient.listen('ping', ((res, sendResponse) => {
            sendResponse('pong');
        }));
    }

    async listenSetPersonalPermissionCmd() {
        contentClient.listen('get-current-permission', async (res, sendResponse) => {
            await storage.set('personalPermission', res.params, true);
            sendResponse(new ChromeMessage('set personal permission success'));
        });
    }

    initContentMenu() {
        create({
            id: 'demo',
            title: '显示drawer组件',
            onclick: () => {
                parentClient.sendMessage(new ChromeMessage('show drawer'));
            }
        });
    }

    // 初始化消息通道
    initMessageClient() {
        parentClient.listen('test connect', (res, sendResponse) => {
            sendResponse(new ChromeMessage('connect success'));
        });
    }
}
