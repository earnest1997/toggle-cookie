import React, {
    useState, useEffect, cloneElement, useMemo
} from 'react';
import {
    Card,
    Table,
    Radio,
    Button,
    Modal,
    Form,
    Input,
    Checkbox,
    message
} from 'antd';
import {
    storage, setData, removeData
} from '../../chrome';
import './view.scss';

const { Item: FormItem, useForm } = Form;
const { Group } = Checkbox;
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 }
};
const { confirm } = Modal;

function Manager() {
    const [activeTab, setActiveTab] = useState('user');
    const [users, setUsers] = useState([]);
    const [pers, setPers] = useState([]);
    const [privatePers, setPrivatePers] = useState([]);
    const [modalVisible, setModalVisible] = useState('');
    const [isSetCookie, setCookieStatus] = useState();
    const [userForm, dadd] = useForm();
    const [persForm] = useForm();

    const obj2Arr = (obj) => Object.entries(obj).reduce(
        (prev, [k, v]) => [...prev, { name: k, ...v }],
        []
    );

    const setList = async () => {
        const user = await storage.get('users');
        const permission = await storage.get('permission');
        if (user) {
            setUsers([...obj2Arr(user)]);
        }
        if (permission) {
            setPers(obj2Arr(permission));
        }
    };
    const delUser = async (username) => {
        await removeData(username);
        setList();
    // confirm({
    //   wrapClassName:WRAPPER_CLASS_NAME,
    //   className:`${WRAPPER_CLASS_NAME} op-modal`,
    //   centered:true,
    //   icon: <ExclamationCircleOutlined style={{color:'#f77f00'}}/>,
    //   content: <p style={{marginBottom:'10px'}}>确定删除该帐号？</p>,
    //   onOk: () => {
    //       window.alert(99)
    //     removeData(username);
    //     setList();
    //   },
    // });
    };
    const editUser = (rowData) => {
        console.log(rowData);
        userForm.setFieldsValue({ ...rowData });
        setModalVisible('editUser');
    };

    const columns01 = [
        { title: '账户名称', dataIndex: 'name' },
        { title: '账号', dataIndex: 'account' },
        {
            title: '权限',
            dataIndex: 'pers',
            render: (val) => (val ? val.join(',') : '')
        },
        {
            title: '操作',
            render: (row) => {
                const { name } = row;
                return (
                    <>
                        <Button type="text" onClick={editUser.bind(this, row)}>
                            编辑
                        </Button>
                        <Button type="text" danger onClick={delUser.bind(this, name)}>
                            删除
                        </Button>
                    </>
                );
            }
        }
    ].map((item) => ({ ...item, align: 'center' }));

    const delPermission = async (name) => {
        await removeData(name, 'permission');
        setList();
    };

    const columns02 = [
        { title: '权限名称', dataIndex: 'name' },
        { title: '权限描述', dataIndex: 'desc' },
        {
            title: '操作',
            render: (row) => {
                const { name } = row;
                return (
                    <Button danger onClick={delPermission.bind(this, name)} type="text">
                        删除
                    </Button>
                );
            }
        }
    ].map((item) => ({ ...item, align: 'center' }));

    const getCurrentUserPermission = async () => {
        const personalPermission = await storage.get('personalPermission', true);
        console.log(personalPermission, 88);
        if (personalPermission) {
            setPrivatePers(personalPermission);
            let newPers = userForm.getFieldValue('pers') || [];
            newPers = [...newPers, ...personalPermission];
            userForm.setFieldsValue({ pers: newPers.map((item) => item.name || item) });
            console.log(userForm.getFieldsValue(), dadd);
        }
    };

    useEffect(setList, []);

    const closeModal = () => {
        setModalVisible('');
        setPrivatePers([]);
    };

    const saveUser = async () => {
        await userForm.validateFields().then(() => {
            const formData = userForm.getFieldsValue();
            console.log(formData, 'cnm');
            const { name, ...rest } = formData;
            setUsers((prev) => [...prev, formData]);
            setData(name, rest);
            closeModal();
        });
    };

    const saveEditUser = async (name) => {
        await userForm.validateFields().then(() => {
            const formData = userForm.getFieldsValue();
            const index = users.findIndex((item) => item.name === name);
            setUsers((prev) => {
                const newList = [...prev];
                newList.splice(index, 1, formData);
                return newList;
            });
            const { name: username, ...rest } = formData;
            setData(username, rest);
            closeModal();
        });
    };

    const savePermission = () => {
        persForm.validateFields().then(() => {
            const formData = persForm.getFieldsValue();
            const { name, ...rest } = formData;
            setPers((prev) => [...prev, formData]);
            setData(name, rest, 'permission');
            closeModal();
        });
    };

    const importCookie = async () => {
        const cookie = await storage.get('currentUserCookie', true);
        if (!cookie) {
            message.error('无法获取当前用户cookie，请确定是否登录');
            return;
        }
        userForm.setFieldsValue({ cookie });
        setCookieStatus(true);
    };

    const isEditModal = useMemo(() => modalVisible === 'editUser', [modalVisible]);
    return (
        <div className={`${WRAPPER_CLASS_NAME}`}>
            <main>
                <Radio.Group
                    onChange={({ target: { value } }) => {
                        setActiveTab(value);
                    }}
                    value={activeTab}
                >
                    <Radio value="user">用户管理</Radio>
                    <Radio value="permission">权限管理</Radio>
                </Radio.Group>

                <div className="row-1">
                    {activeTab === 'user' ? (
                        <Button onClick={() => setModalVisible('user')} type="primary">
                            新建用户
                        </Button>
                    ) : (
                        <>
                            <Button onClick={() => setModalVisible('pers')} type="primary">
                                新建权限
                            </Button>
                        </>
                    )}
                </div>

                {activeTab === 'user' ? (
                    <Table
                        columns={columns01}
                        dataSource={users}
                        bordered
                        rowKey={(row) => row.name}
                    />
                ) : (
                    <Table
                        columns={columns02}
                        dataSource={pers}
                        bordered
                        rowKey={(row) => row.name}
                    />
                )}

                <Modal
                    title={isEditModal ? '编辑用户' : '新建用户'}
                    centered
                    visible={['user', 'editUser'].includes(modalVisible)}
                    wrapClassName={`${WRAPPER_CLASS_NAME}`}
                    onCancel={closeModal}
                    onOk={
                        isEditModal
                            ? saveEditUser.bind(null, userForm.getFieldsValue().name)
                            : saveUser
                    }
                >
                    <Form form={userForm} {...formItemLayout} initialValues={{ pers: [] }}>
                        <FormItem label="账户名称" name="name" rules={[{ required: true }]}>
                            {isEditModal ? (
                                cloneElement(<Input />, { disabled: true })
                            ) : (
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label="账号" name="account">
                            <Input />
                        </FormItem>
                        <FormItem label="权限">
                            <Button size="small" onClick={getCurrentUserPermission} type="primary">导入(/更新)当前用户权限</Button>
                            <FormItem name="pers" className="pers-wrapper">
                                {(pers.length || privatePers.length) ? (
                                    <Group>
                                        {[...pers, ...privatePers].map(({ name }, index) => (
                                            cloneElement(<Checkbox value={name} key={index}>
                                                {name}
                                            </Checkbox>, { ...(privatePers.find((item) => item.name === name) && { disabled: true }) })
                                        ))}
                                    </Group>
                                ) : (
                                    <span className="no-permission">暂无手动创建的权限，请新建</span>
                                )}
                            </FormItem>
                        </FormItem>
                        {!isEditModal && (
                            <FormItem
                                name="cookie"
                                rules={[{ required: true }]}
                                label="cookie"
                            >
                                {cloneElement(
                                    <Button
                                        size="small"
                                        onClick={importCookie}
                                        type="primary"
                                    >
                                        导入当前用户cookie
                                    </Button>,
                                    { ...(isSetCookie && { disabled: true }) }
                                )}

                                {isSetCookie && <span>已导入</span>}
                            </FormItem>
                        )}
                    </Form>
                    <ul className="tips">
                        <li>* 注：权限仅可编辑手动创建的权限 *</li>
                        <li>* 自动导入权限仅适用于快传号 *</li>
                    </ul>
                </Modal>

                <Modal
                    centered
                    title="新建权限"
                    visible={modalVisible === 'pers'}
                    wrapClassName={`${WRAPPER_CLASS_NAME}`}
                    onCancel={closeModal}
                    onOk={savePermission}
                >
                    <Form form={persForm} {...formItemLayout}>
                        <FormItem label="权限名称" name="name" rules={[{ required: true }]}>
                            <Input />
                        </FormItem>
                        <FormItem label="权限描述" name="desc">
                            <Input />
                        </FormItem>
                    </Form>
                </Modal>
            </main>
        </div>
    );
}

export default Manager;
