import React, { useState, useEffect } from 'react';
import {
    Card, Table, Radio, Button, Modal, Form, Input, Checkbox
} from 'antd';
import { storage, addData } from '../../chrome';

const { Item: FormItem, useForm } = Form;
const { Group } = Checkbox;

const columns01 = [{ title: '账户名称', dataIndex: 'name' }, { title: '账号', dataIndex: 'account' }, { title: '权限', dataIndex: 'per', render: (val) => val.join(',') }];
const columns02 = [{ title: '权限名称', dataIndex: 'name' }, { title: '权限描述' }];

function Manager() {
    const [activeTab, setActiveTab] = useState('user');
    const [users, setUsers] = useState([]);
    const [pers, setPers] = useState([]);
    const [modalVisible, setModalVisible] = useState('');
    const [userForm] = useForm();
    const [persForm] = useForm();

    const obj2Arr = (obj) => Object.entries(obj).reduce((prev, [k, v]) => [...prev, { name: k, ...v }]);

    useEffect(() => {
        const user = storage.get('users');
        const permission = storage.get('permission');
        if (user) {
            setUsers(obj2Arr(user));
        }
        if (permission) {
            setPers(obj2Arr(permission));
        }
    }, []);

    const saveUser = () => {
        userForm.validateFields().then(() => {
            const formData = userForm.getFieldsValue();
            const { name, ...rest } = formData;
            setUsers((prev) => [...prev, { formData }]);
            addData(name, rest);
        });
    };

    const savePermission = () => {
        persForm.validateFields().then(() => {
            const formData = persForm.getFieldsValue();
            const { name, ...rest } = formData;
            setPers((prev) => [...prev, { formData }]);
            addData(name, rest, 'permission');
        });
    };

    return (
        <div className={`${WRAPPER_CLASS_NAME}`}>
            <div className="row-1">
                <Button onClick={() => setModalVisible('user')}>新建用户</Button>
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

            {modalVisible === 'user' && (
                <Modal title="新建用户">
                    <Form form={userForm}>
                        <FormItem label="账户名称" name="name" rules={[{ required: true }]}>
                            <Input />
                        </FormItem>
                        <FormItem label="账号" name="account">
                            <Input />
                        </FormItem>
                        <FormItem label="权限">
                            <Group>
                                {pers.map(({ name, value }) => (<Checkbox value={value}>{name}</Checkbox>))}
                            </Group>
                        </FormItem>
                        <FormItem>
                            <Button onClick={saveUser}>保存</Button>
                        </FormItem>
                    </Form>
                </Modal>
            )}

            {modalVisible === 'pers' && (
                <Modal title="新建权限">
                    <Form form={userForm}>
                        <FormItem label="权限名称" name="name" rules={[{ required: true }]}>
                            <Input />
                        </FormItem>
                        <FormItem label="权限描述" name="desc">
                            <Input />
                        </FormItem>
                        <FormItem>
                            <Button onClick={savePermission}>保存</Button>
                        </FormItem>
                    </Form>
                </Modal>
            )}
        </div>
    );
}

export default Manager;
