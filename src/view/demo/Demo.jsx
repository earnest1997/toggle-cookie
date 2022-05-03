import React, { useState, useEffect } from 'react';
import {
    Card, Table, Radio, Button, Modal, Form, Input, Checkbox
} from 'antd';
import { storage, addData, getCookie } from '../../chrome';
import './view.scss';

const { Item: FormItem, useForm } = Form;
const { Group } = Checkbox;

const columns01 = [{ title: '账户名称', dataIndex: 'name' }, { title: '账号', dataIndex: 'account' }, { title: '权限', dataIndex: 'per', render: (val) => (val ? val.join(',') : '') }];
const columns02 = [{ title: '权限名称', dataIndex: 'name' }, { title: '权限描述', dataIndex: 'desc' }];
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 }
};

function Manager() {
    const [activeTab, setActiveTab] = useState('user');
    const [users, setUsers] = useState([]);
    const [pers, setPers] = useState([]);
    const [modalVisible, setModalVisible] = useState('');
    const [userForm] = useForm();
    const [persForm] = useForm();

    const obj2Arr = (obj) => Object.entries(obj).reduce((prev, [k, v]) => [...prev, { name: k, ...v }], []);

    useEffect(async () => {
        const user = await storage.get('users');
        const permission = await storage.get('permission');
        console.log(user, permission);
        if (user) {
            setUsers(obj2Arr(user));
        }
        if (permission) {
            setPers(obj2Arr(permission));
        }
    }, []);

    const closeModal = () => {
        setModalVisible('');
    };

    const saveUser = () => {
        userForm.validateFields().then(() => {
            const formData = userForm.getFieldsValue();
            const { name, ...rest } = formData;
            setUsers((prev) => [...prev, formData]);
            addData(name, rest);
            closeModal();
        });
    };

    const savePermission = () => {
        persForm.validateFields().then(() => {
            const formData = persForm.getFieldsValue();
            const { name, ...rest } = formData;
            setPers((prev) => [...prev, formData]);
            addData(name, rest, 'permission');
            closeModal();
        });
    };

    const importCookie = () => {

    };

    return (
        <div className={`${WRAPPER_CLASS_NAME}`}>
            <div className="row-1">
                <Button onClick={() => setModalVisible('user')} type="primary">新建用户</Button>
                <Button onClick={() => setModalVisible('pers')}>新建权限</Button>
            </div>
            <Radio.Group
                onChange={({ target: { value } }) => {
                    setActiveTab(value);
                }}
                value={activeTab}
            >
                <Radio value="user">用户管理</Radio>
                <Radio value="permission">权限管理</Radio>

            </Radio.Group>

            {activeTab === 'user' ? <Table columns={columns01} dataSource={users} />
                : <Table columns={columns02} dataSource={pers} />}

            <Modal title="新建用户" visible={modalVisible === 'user'} wrapClassName={`${WRAPPER_CLASS_NAME}`} onCancel={closeModal} onOk={saveUser}>
                <Form form={userForm} {...formItemLayout} initialValues={{ per: [] }}>
                    <FormItem label="账户名称" name="name" rules={[{ required: true }]}>
                        <Input />
                    </FormItem>
                    <FormItem label="账号" name="account">
                        <Input />
                    </FormItem>
                    <FormItem label="权限" name="per">
                        {pers.length ? (
                            <Group>
                                {pers.map(({ name }, index) => (<Checkbox value={name} key={index}>{name}</Checkbox>))}
                            </Group>
                        ) : '暂无权限，请新建'}
                    </FormItem>
                    <FormItem>
                        <Button size="small" onClick={importCookie}>导入当前用户cookie</Button>
                    </FormItem>
                </Form>
            </Modal>

            <Modal title="新建权限" visible={modalVisible === 'pers'} wrapClassName={`${WRAPPER_CLASS_NAME}`} onCancel={closeModal} onOk={savePermission}>
                <Form form={persForm} {...formItemLayout}>
                    <FormItem label="权限名称" name="name" rules={[{ required: true }]}>
                        <Input />
                    </FormItem>
                    <FormItem label="权限描述" name="desc">
                        <Input />
                    </FormItem>
                </Form>
            </Modal>
        </div>
    );
}

export default Manager;
