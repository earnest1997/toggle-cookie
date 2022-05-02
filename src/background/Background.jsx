import {
    create, parentClient, ChromeMessage, reload
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
                parentClient.seedMessage(new ChromeMessage('show drawer'));
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
