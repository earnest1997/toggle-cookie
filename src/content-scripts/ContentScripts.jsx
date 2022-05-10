import { contentClient, ChromeMessage } from '../chrome/message';
import { kuaichuanPermissionConf } from './config';
import './ContentScripts.scss';

export default class ContentScripts {
    constructor() {
        this.container = null;
        this.init();
    }

    async init() {
    // 注意，必须设置了run_at=document_start 此段代码才会生效
        document.addEventListener('DOMContentLoaded', () => {
            this.listenSetCookieCmd();
            this.sendUserPermission();
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
        console.log(permissions, 'permis');
        if (permissions) {
            permissions = permissions[0].split(',');
            const personalPers = permissions
                .filter((item) => item in kuaichuanPermissionConf)
                .map((item) => ({ name: kuaichuanPermissionConf[item] }));
            console.log(personalPers, 'pers');
            contentClient.sendMessage(new ChromeMessage('get-current-permission', personalPers));
        }
    }
}
