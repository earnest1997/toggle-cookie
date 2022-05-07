import {
    create, parentClient, ChromeMessage, contentClient
} from '../chrome';

export default class Background {
    constructor() {
        this.init();
    }

    init() {
        this.initContentMenu();
        this.listenSetCookieCmd();
        this.listenSetPersonalPermissionCmd();
    }

    // 初始化右键菜单
    initContentMenu() {
        create({
            id: 'demo',
            title: '演示右键功能',
            onclick: () => {
                parentClient.sendMessage(new ChromeMessage('set cookie'));
            }
        });
    }

    // 初始化消息通道
    listenSetCookieCmd() {
        contentClient.listen('set-cookie', (res, sendResponse) => {
            window.currentUserCookie = res.params;
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
