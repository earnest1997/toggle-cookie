import {
    parentClient, ChromeMessage, contentClient, storage
} from '../chrome';

export default class Background {
    constructor() {
        this.init();
    }

    init() {
        this.listenSetCookieCmd();
        this.listenPing();
        this.listenSetPersonalPermissionCmd();
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
}
