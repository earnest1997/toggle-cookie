import {
    contentClient, listeners,
} from '../chrome';
import './ContentScripts.scss';

export default class ContentScripts {
    constructor() {
        this.container = null;
        this.init();
    }

    async init() {
        // 注意，必须设置了run_at=document_start 此段代码才会生效
        document.addEventListener('DOMContentLoaded', () => {
            this.initMessageClient();
            this.initContainer();
            console.log('test');
        });
    }

    // 初始化消息通道
    initMessageClient() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('cncncnncn', listeners, request);
            const { msg, params } = request;
            console.log(params, 'obje');
            if (msg === 'set-parent-cookie') {
                params.forEach((item) => {
                    const { value, httpOnly, ...obj } = item;
                    const cookie = Object.entries(obj || {}).reduce((prev, [key, val]) => {
                        if (key === 'name') {
                            return `${prev}${val}=${value};`;
                        }
                        return `${prev}${key}=${val};`;
                    }, '');
                    document.cookie = cookie;
                });
                window.location.reload();
            }
        });
        contentClient.listen('set-parent-cookie', (res, sendResponse) => {
            // console.log(res, 999);
            // this.showContainer();

            // render(
            //     <DrawerDemo onClose={() => { this.hideContainer(); }} />,
            //     this.container
            // );
        });
    }

    // // 初始化外层包裹元素
    // initContainer() {
    //     const { document } = window;
    //     this.container = document.createElement('div');
    //     this.container.setAttribute('id', 'chrome-extension-content-base-element');
    //     this.container.setAttribute('class', WRAPPER_CLASS_NAME);
    //     document.body.appendChild(this.container);
    // }

    // showContainer() {
    //     this.container.setAttribute('style', 'display: block');
    // }

    // hideContainer() {
    //     this.container.setAttribute('style', 'display: none');
    // }
}
