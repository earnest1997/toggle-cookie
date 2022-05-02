import React from 'react';
import { render } from 'react-dom';
import { contentClient } from '../chrome';
import './ContentScripts.scss';
import DrawerDemo from './DrawerDemo';

export default class ContentScripts {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // 注意，必须设置了run_at=document_start 此段代码才会生效
        document.addEventListener('DOMContentLoaded', () => {
            this.initContainer();
            this.initMessageClient();
        });
    }

    // 初始化消息通道
    initMessageClient() {
        contentClient.listen('set-cookie', (objArr) => {
            objArr.map((item) => {
                const { value, httpOnly, ...obj } = item;
                const cookie = Object.entries(obj || {}).reduce((prev, [key, val]) => {
                    if (key === 'name') {
                        return `${prev}${val}=${value};`;
                    }
                    return `${prev}${key}=${val};`;
                }, '');
                document.cookie = cookie;
            });
        });
    }
}
