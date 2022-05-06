import React, { useState, useEffect, cloneElement, useMemo } from 'react';
import {
  Card,
  Table,
  Radio,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  message,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { storage, setData, getBgWindow, removeData } from '../../chrome';
import './view.scss';

const { Item: FormItem, useForm } = Form;
const { Group } = Checkbox;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const { confirm } = Modal;

function Manager() {
  const [activeTab, setActiveTab] = useState('user');
  const [users, setUsers] = useState([]);
  const [pers, setPers] = useState([]);
  const [modalVisible, setModalVisible] = useState('');
  const [isSetCookie, setCookieStatus] = useState();
  const [userForm] = useForm();
  const [persForm] = useForm();

  const obj2Arr = (obj) =>
    Object.entries(obj).reduce(
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
      dataIndex: 'per',
      render: (val) => (val ? val.join(',') : ''),
    },
    {
      title: '操作',
      render: (row) => {
        const { name } = row;
        return (
          <>
            <Button type='text' onClick={editUser.bind(this, row)}>
              编辑
            </Button>
            <Button type='text' danger onClick={delUser.bind(this, name)}>
              删除
            </Button>
          </>
        );
      },
    },
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
          <Button danger onClick={delPermission.bind(this, name)} type='text'>
            删除
          </Button>
        );
      },
    },
  ].map((item) => ({ ...item, align: 'center' }));

  useEffect(setList, []);

  const closeModal = () => {
    setModalVisible('');
  };

  const saveUser = async () => {
    await userForm.validateFields().then(() => {
      const formData = userForm.getFieldsValue();
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
      const { name, ...rest } = formData;
      setData(name, rest);
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

  const importCookie = () => {
    const cookie = getBgWindow().currentUserCookie;
    if (!cookie) {
      message.error('无法获取当前用户cookie，请确定是否登录');
      return;
    }
    userForm.setFieldsValue({ cookie });
    setCookieStatus(true);
  };

  const isEditModal = useMemo(() => {
    return modalVisible === 'editUser';
  }, [modalVisible]);

  return (
    <div className={`${WRAPPER_CLASS_NAME}`}>
      <main>
        <Radio.Group
          onChange={({ target: { value } }) => {
            setActiveTab(value);
          }}
          value={activeTab}
        >
          <Radio value='user'>用户管理</Radio>
          <Radio value='permission'>权限管理</Radio>
        </Radio.Group>

        <div className='row-1'>
          {activeTab === 'user' ? (
            <Button onClick={() => setModalVisible('user')} type='primary'>
              新建用户
            </Button>
          ) : (
            <Button onClick={() => setModalVisible('pers')} type='primary'>
              新建权限
            </Button>
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
          <Form form={userForm} {...formItemLayout} initialValues={{ per: [] }}>
            <FormItem label='账户名称' name='name' rules={[{ required: true }]}>
              {isEditModal ? (
                cloneElement(<Input />, { disabled: true })
              ) : (
                <Input />
              )}
            </FormItem>
            <FormItem label='账号' name='account'>
              <Input />
            </FormItem>
            <FormItem label='权限' name='per'>
              {pers.length ? (
                <Group>
                  {pers.map(({ name }, index) => (
                    <Checkbox value={name} key={index}>
                      {name}
                    </Checkbox>
                  ))}
                </Group>
              ) : (
                '暂无权限，请新建'
              )}
            </FormItem>
            {!isEditModal && (
              <FormItem
                name='cookie'
                rules={[{ required: true }]}
                label='cookie'
              >
                <Button
                  size='small'
                  onClick={importCookie}
                  {...(isSetCookie && { className: 'disabled' })}
                  type='primary'
                >
                  导入当前用户cookie
                </Button>
                {isSetCookie && <span>已导入</span>}
              </FormItem>
            )}
          </Form>
        </Modal>

        <Modal
          centered
          title='新建权限'
          visible={modalVisible === 'pers'}
          wrapClassName={`${WRAPPER_CLASS_NAME}`}
          onCancel={closeModal}
          onOk={savePermission}
        >
          <Form form={persForm} {...formItemLayout}>
            <FormItem label='权限名称' name='name' rules={[{ required: true }]}>
              <Input />
            </FormItem>
            <FormItem label='权限描述' name='desc'>
              <Input />
            </FormItem>
          </Form>
        </Modal>
      </main>
    </div>
  );
}

export default Manager;
