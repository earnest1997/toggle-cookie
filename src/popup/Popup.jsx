import React, { Component } from 'react';
import {
    Avatar, Empty, Button, Collapse, Tooltip
} from 'antd';
import { ExportOutlined, ImportOutlined } from '@ant-design/icons';
import './Popup.scss';
import { go, storage, toggleUser } from '../chrome';

const { Panel } = Collapse;

function Toolbar() {
    return (
        <>
            <Tooltip title="导出配置">
                <ExportOutlined />
            </Tooltip>
            <Tooltip title="导入配置">
                <ImportOutlined />
            </Tooltip>
        </>
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
            list: []
        };
    }

    gotoPage() {
        go('../html/view.html');
    }

    toggleUser(index) {
        this.state.activeIndex = index;
    }

    renderEmpty() {
        return (
            <>
                <Empty />
            </>
        );
    }

    async componentDidMount() {
        const users = await storage.get('users');
        console.log(users, 99);
        this.setState({ list: obj2Arr(users || {}) });
    }

    // eslint-disable-next-line react/require-render-return
    render() {
        const list = this.state.list.map(({ name, per }, index) => {
            const active = this.state.activeIndex === index;
            let btn = <Button type="link" onClick={() => this.toggleUser(index)}>切换</Button>;
            btn = active ? React.cloneElement(btn, { disabled: true, className: 'disable' }) : btn;
            return (
                <Panel
                    key={index}
                    header={(
                        <>
                            <Avatar />
                            {' '}
                            <span>{name }</span>
                            <div className="toolbar">
                                {btn}
                            </div>
                        </>
                    )}
                >
                    <h5>拥有的权限：</h5>
                    <p>{per ? per.join(',') : '暂未配置权限'}</p>
                </Panel>
            );
        });
        console.log(list);
        return (
            <div className={`${WRAPPER_CLASS_NAME}`}>
                <div className="row-1 test">
                    <Toolbar />
                </div>
                {list.length ? (
                    <Collapse className="row-2">
                        {list}
                    </Collapse>
                ) : <Empty /> }
                <div className="row-3">
                    {list.length ? <Manager /> : <Button type="link" onClick={this.gotoPage}>新建用户</Button>}
                </div>
            </div>
        );
    }
}
