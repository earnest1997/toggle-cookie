import React from 'react';
import { render } from 'react-dom';
import { contentClient, ChromeMessage } from '../chrome/message';
import { kuaichuanPermissionConf } from './config';
import DrawerDemo from './DrawerDemo';
import './ContentScripts.scss';

export default class ContentScripts {
    constructor() {
        this.container = null;
        this.init();
    }

    async init() {
        this.setHeartBeat();
        // 注意，必须设置了run_at=document_start 此段代码才会生效
        document.addEventListener('DOMContentLoaded', () => {
            this.listenSetCookieCmd();
            this.sendUserPermission();

            this.initContainer();
            this.initMessageClient();
        });
    }

    listenSetCookieCmd() {
        contentClient.listen('set-parent-cookie', (request, sendResponse) => {
            const { params } = request;
            params.forEach((item) => {
                const { value, httpOnly, ...obj } = item;
                const cookie = Object.entries(obj || {}).reduce(
                    (prev, [key, val]) => {
                        if (key === 'name') {
                            return `${prev}${val}=${value};`;
                        }
                        return `${prev}${key}=${val};`;
                    },
                    ''
                );
                document.cookie = cookie;
            });
            sendResponse('set parent cookie success');
            window.location.reload();
        });
    }

    sendUserPermission() {
        let htmlContent = document.getElementsByTagName('body')[0];
        if (!htmlContent) return;
        htmlContent = htmlContent.innerHTML;
        const reg = /(?<=privilege:)(.*)/;
        let permissions = htmlContent.match(reg);
        let personalPers = [];
        if (permissions) {
            permissions = permissions[0].split(',');
            personalPers = permissions
                .filter((item) => item in kuaichuanPermissionConf)
                .map((item) => ({ name: kuaichuanPermissionConf[item] }));
        }

        console.log(personalPers, 9);
        contentClient.sendMessage(new ChromeMessage('get-current-permission', personalPers));
    }

    setHeartBeat() {
        setTimeout(() => {
            contentClient.sendMessage('ping');
        }, 10);
    }

    setWindowVar() {
        const dom = document.createElement('script');
        dom.id = 'testSrc';
        dom.textContent = "window.test='test';";
        document.head.prepend(dom);
    }

    // 初始化消息通道
    initMessageClient() {
        console.log(98009);
        const { container } = this;

        contentClient.listen('show drawer', () => {
            this.showContainer();

            render(
                <DrawerDemo onClose={() => { this.hideContainer(); }} />,
                container
            );
        });
    }

    // 初始化外层包裹元素
    initContainer() {
        const { document } = window;
        const base = document.querySelector('#chrome-extension-content-base-element');
        if (base) {
            this.container = base;
        } else {
            this.container = document.createElement('div');
            this.container.setAttribute('id', 'chrome-extension-content-base-element');
            this.container.setAttribute('class', WRAPPER_CLASS_NAME);
            document.body.appendChild(this.container);
        }
    }

    showContainer() {
        this.container.setAttribute('style', 'display: block');
    }

    hideContainer() {
        this.container.setAttribute('style', 'display: none');
    }
}
