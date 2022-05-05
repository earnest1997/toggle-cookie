import React, { Component } from 'react';
import {
    Avatar, Empty, Button, Collapse, Tooltip
} from 'antd';
import { ExportOutlined, ImportOutlined, RightOutlined } from '@ant-design/icons';
import './Popup.scss';
import {
    go, storage, toggleUser, getCookie, contentClient, ChromeMessage, getPageInfo
} from '../chrome';

const { Panel } = Collapse;

function Toolbar() {
    return (
        <div className="toolbar">
            <span title="导出配置">
                <ExportOutlined />
            </span>
            <span title="导入配置">
                <ImportOutlined />
            </span>
        </div>
    );
}

function Manager() {
    return <Button type="link" onClick={() => go('../html/view.html')}>管理cookie</Button>;
}

const obj2Arr = (obj) => Object.entries(obj).reduce((prev, [k, v]) => [...prev, { name: k, ...v }], []);

export default class Popup extends Component {
    constructor() {
        super();
        this.state = {
            activeIndex: -1,
            list: [],
            host: ''
        };
    }

    gotoPage() {
        go('../html/view.html');
    }

    async toggleUser(index, name) {
        const tab = await getPageInfo();
        const { url, domain } = tab;
        console.log(index, name, 99);
        this.setState({ activeIndex: index });
        setTimeout(() => {
            toggleUser({ name, domain, url });
        }, 10);
    }

    renderEmpty() {
        return (
            <>
                <Empty />
            </>
        );
    }

    async setCookie() {
        const tab = await getPageInfo();
        const { url } = tab;
        const currentUserCookie = await getCookie(url);
        const res = await contentClient.sendMessage(new ChromeMessage('set-cookie', currentUserCookie));
        console.log(currentUserCookie, res, tab);
        // chrome.tabs.query({
        //     currentWindow: true,
        //     active: true
        // }, async (tabs) => {
        //     console.log(tabs, 88);
        //     const tab = tabs[0];

        // });
    }

    async componentDidMount() {
        const tab = await getPageInfo();
        const { domain } = tab;
        const users = await storage.get('users');
        console.log(users, 'users');
        this.setState({ list: obj2Arr(users || {}), host: domain });
        this.setCookie();
    }

    // eslint-disable-next-line react/require-render-return
    render() {
        const list = this.state.list.map(({ name, per }, index) => {
            const active = this.state.activeIndex === index;
            let btn = <Button type="link" onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); this.toggleUser(index, name); }}>切换</Button>;
            btn = active ? React.cloneElement(btn, { disabled: true, className: 'disable' }) : btn;
            return (
                <Panel
                    key={index}
                    className={`${active ? 'active' : ''}`}
                    header={(
                        <div className={`panel-header-wrapper ${active ? 'active' : ''}`}>
                            <div className="panel-header">
                                <Avatar />
                                {' '}
                                <span>{name }</span>
                                <div className="toolbar">
                                    {btn}
                                </div>
                            </div>
                            <RightOutlined className="ant-collapse-btn" />
                        </div>
                    )}
                >
                    <h5>拥有的权限：</h5>
                    <p>{per ? per.join(',') : '暂未配置权限'}</p>
                </Panel>
            );
        });
        return (
            <div className={`${WRAPPER_CLASS_NAME}`}>
                <div className="row-1">
                    <i className="title" title={this.state.host}>{this.state.host}</i>
                    <Toolbar />
                </div>
                {list.length ? (
                    <Collapse className="row-2">
                        {list}
                    </Collapse>
                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }
                <div className="row-3">
                    {list.length ? <Manager /> : <Button type="link" onClick={this.gotoPage}>新建用户</Button>}
                </div>
            </div>
        );
    }
}
