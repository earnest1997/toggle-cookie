import {
    create, parentClient, ChromeMessage, contentClient
} from '../chrome';

export default class Background {
    constructor() {
        this.init();
    }

    init() {
        this.listenSetCookieCmd();
        this.listenSetPersonalPermissionCmd();
    }

    getWindow() {
        return chrome.windows.getCurrent;
    }

    // 初始化消息通道
    async listenSetCookieCmd() {
        const currentWindow = await this.getWindow();
        contentClient.listen('set-cookie', (res, sendResponse) => {
            currentWindow.currentUserCookie = res.params;
            sendResponse(new ChromeMessage('set cookie success'));
        });
    }

    async listenSetPersonalPermissionCmd() {
        const currentWindow = await this.getWindow();
        contentClient.listen('get-current-permission', (res, sendResponse) => {
            console.log(res.params, 'res');
            currentWindow.personalPermission = res.params;
            sendResponse(new ChromeMessage('set personal permission success'));
        });
    }
}
