import React, { Component } from 'react';
import {
    Avatar, Empty, Button, Collapse, Tooltip
} from 'antd';
import {
    ExportOutlined,
    ImportOutlined,
    RightOutlined
} from '@ant-design/icons';
import './Popup.scss';
import { saveAs } from 'file-saver';
import beautifyJson from 'json-beautify';
import {
    go,
    storage,
    toggleUser,
    getCookie,
    contentClient,
    ChromeMessage,
    getPageInfo
} from '../chrome';

const { Panel } = Collapse;

function Toolbar({ setList }) {
    const exportConfig = async () => {
        let jsonConfig = {
            users: await storage.get('users'),
            permission: await storage.get('permission')
        };
        jsonConfig = beautifyJson(jsonConfig, null, 2, 80);
        const blob = new Blob([jsonConfig], { type: 'application/json' });
        saveAs(blob, 'config.json');
    };

    const saveConfig = (result) => {
        try {
            const config = JSON.parse(result);
            const { users, permission } = config;
            storage.set('users', users);
            setList(users);
            storage.set('permission', permission);
        } catch (err) {
            alert(`${err.message},不合法的配置文件，请检查`);
        }
    };

    const onFileChange = (e) => {
        const myFile = e.target.files[0];
        const reader = new FileReader();
        let result;
        reader.readAsText(myFile);
        reader.onload = function () {
            result = reader.result;
            saveConfig(result);
        };
    };

    return (
        <div className="toolbar">
            <div title="导出配置">
                <ExportOutlined onClick={exportConfig} />
            </div>
            <div title="导入配置">
                <input type="file" onChange={onFileChange} />
                <ImportOutlined onClick={(e) => e.preventDefault()} />
            </div>
        </div>
    );
}

function Manager({ gotoPage }) {
    return (
        <Button type="link" onClick={gotoPage}>
            管理cookie
        </Button>
    );
}

const obj2Arr = (obj) => Object.entries(obj).reduce(
    (prev, [k, v]) => [...prev, { name: k, ...v }],
    []
);
export default class Popup extends Component {
    constructor() {
        super();
        this.state = {
            activeIndex: -1,
            list: [],
            host: ''
        };
    }

    gotoPage(domain) {
        go(`../html/view.html?domain=${domain || this.state.host}`);
    }

    async toggleUser(index, name) {
        const tab = await getPageInfo();
        const { url, domain } = tab;
        this.setState({ activeIndex: index });
        setTimeout(() => {
            toggleUser({ name, domain, url });
        }, 10);
    }

    renderEmpty() {
        return (
            <>
                <Empty description="没有数据" />
            </>
        );
    }

    async setCookie(url) {
        const currentUserCookie = await getCookie(url);
        await contentClient.sendMessage(
            new ChromeMessage('set-cookie', currentUserCookie)
        );
    }

    setList(users) {
        this.setState({ list: obj2Arr(users || {}) });
    }

    async initData(domain) {
        const users = await storage.get('users');
        const list = obj2Arr(users || {});
        console.log(users, 'users');
        this.setState({ list, host: domain });
        // const activeName = await storage.get('activeUser');
        // if (activeName && list.length) {
        //     const activeIndex = list.findIndex(({ name }) => name === activeName);
        //     this.setState({ activeIndex });
        // }
    }

    async componentDidMount() {
        const tab = await getPageInfo();
        const { domain, url } = tab;
        this.initData(domain);
        this.setCookie(url);
    }

    // eslint-disable-next-line react/require-render-return
    render() {
        const list = this.state.list.map(({ name, pers }, index) => {
            const active = this.state.activeIndex === index;
            let btn = (
                <Button
                    type="link"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        this.toggleUser(index, name);
                    }}
                >
                    切换
                </Button>
            );
            btn = active
                ? React.cloneElement(btn, { disabled: true, className: 'disable' })
                : btn;
            return (
                <Panel
                    key={index}
                    className={`${active ? 'active' : ''}`}
                    header={(
                        <div className={`panel-header-wrapper ${active ? 'active' : ''}`}>
                            <div className="panel-header">
                                <Avatar />
                                {' '}
                                <span>{name}</span>
                                <div className="toolbar">{btn}</div>
                            </div>
                            <RightOutlined className="ant-collapse-btn" />
                        </div>
                    )}
                >
                    <h5>拥有的权限：</h5>
                    <p>{pers ? pers.join(',') : '暂未配置权限'}</p>
                </Panel>
            );
        });
        return (
            <div className={`${WRAPPER_CLASS_NAME}`} style={{ padding: '0 8px' }}>
                <div className="row-1">
                    <i className="title" title={this.state.host}>
                        {this.state.host}
                    </i>
                    <Toolbar setList={this.setList.bind(this)} />
                </div>
                {list.length ? (
                    <Collapse className="row-2">{list}</Collapse>
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
                <div className="row-3">
                    {list.length ? (
                        <Manager gotoPage={this.gotoPage.bind(null, this.state.host)} />
                    ) : (
                        <Button type="link" onClick={() => this.gotoPage()}>
                            新建用户
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}
