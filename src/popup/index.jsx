import React from 'react';
import { render } from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Popup from './Popup';

render(
    <ConfigProvider locale={zhCN}>
        <Popup />
    </ConfigProvider>,
    document.querySelector('#chrome-extension-popup')
);
