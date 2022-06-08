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

    // 初始化消息通道
    listenSetCookieCmd() {
        contentClient.listen('set-cookie', (res, sendResponse) => {
            console.log('seteted');
            window.currentUserCookie = res.params;
            window.random = Math.random();
            sendResponse(new ChromeMessage('set cookie success'));
        });
    }

    listenSetPersonalPermissionCmd() {
        contentClient.listen('get-current-permission', (res, sendResponse) => {
            console.log(res.params, 'res');
            window.personalPermission = res.params;
            sendResponse(new ChromeMessage('set personal permission success'));
        });
    }
}
