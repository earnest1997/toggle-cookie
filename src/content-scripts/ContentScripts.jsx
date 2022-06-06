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
            console.log('init');
            this.listenSetCookieCmd();
            this.sendUserPermission();
        });
    }

    listenSetCookieCmd() {
        contentClient.listen('set-parent-cookie', (request) => {
            const { params } = request;
            params.forEach((item) => {
                const {
                    value, domain, name
                } = item;
                const now = new Date();
                const time = now.getTime();
                const expireTime = time + 1000 * 36000;
                now.setTime(expireTime);
                console.log(params, 9, `${name}=${value};domain=${domain};httpOnly=false;expires=${now.toUTCString()};secure=false;`);
                document.cookie = `${name}=${value};domain=${domain};expires=${now.toUTCString()}`;
            });
            // window.location.reload();
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
