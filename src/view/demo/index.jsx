import React from 'react';
import { render } from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Demo from './Demo';

render(
    <ConfigProvider locale={zhCN}>
        <Demo />
    </ConfigProvider>,
    document.querySelector('#chrome-extension-view')
);
