import React from 'react';
import { render } from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Setting from './Setting';

render(
    <ConfigProvider locale={zhCN}>
        <Setting />
    </ConfigProvider>,
    document.querySelector('#chrome-extension-view')
);
