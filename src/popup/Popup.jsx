import React, { Component } from 'react';
import {
    Avatar, Empty, Button
} from 'antd';
import { ExportOutlined, ImportOutlined } from '@ant-design/icons';
import './Popup.scss';
import { go, storage } from '../chrome';

function Toolbar() {
    return (
        <>
            <ExportOutlined />
            <ImportOutlined />
        </>
    );
}

function Manager() {
    return <p>管理cookie</p>;
}

export default class Popup extends Component {
    constructor() {
        super();
        this.state = {
            name: WRAPPER_CLASS_NAME,
            activeIndex: -1
        };
    }

    gotoPage() {
        go('../html/view.html');
    }

    setActive(index) {
        this.state.activeIndex = index;
    }

    renderEmpty() {
        return (
            <>
                <Empty />
                <p>
                    暂无数据
                    <Button type="link" onClick={this.gotoPage}>新建用户</Button>
                </p>
            </>
        );
    }

    render() {
        const users = storage.get('users');
        const list = users.map(({ name, ...rest }, index) => (
            <li key={index} onClick={() => this.setActive(index)}>
                <Avatar />
                <span>{name }</span>
            </li>
        ));
        return (
            <div className={`${WRAPPER_CLASS_NAME} popup`}>
                <div className="row-1">
                    <Toolbar />
                </div>
                <ul className="row-2">
                    {list.length ? list : this.renderEmpty() }
                </ul>
                <div className="row-3">
                    <Manager />
                </div>
            </div>
        );
    }
}
