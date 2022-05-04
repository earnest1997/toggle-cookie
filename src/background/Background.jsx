import {
    create, parentClient, ChromeMessage, contentClient, reload, getCookie
} from '../chrome';

export default class Background {
    constructor() {
        this.init();
    }

    init() {
        this.initContentMenu();
        this.initMessageClient();
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
    initMessageClient() {
        contentClient.listen('set-cookie', (res, sendResponse) => {
            console.log(res, 'res');
            window.currentUserCookie = res.params;
            window.test = 999;
            sendResponse(new ChromeMessage('set cookie success'));
        });
    }
}
