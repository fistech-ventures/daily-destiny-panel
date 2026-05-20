import { ImagePaths } from '@lib/constant';
import { AuthHooks } from '@modules/auth/lib/hooks';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { MdLock } from 'react-icons/md';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { IToken } from './auth/lib/interfaces';

interface IProps {
  user: IToken['user'];
}

const signOutFn = AuthHooks.useSignOut;

const ProfileCard: React.FC<IProps> = ({ user }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [isChangePassword, setChangePassword] = useState(false);

  const passwordUpdateFn = AuthHooks.usePasswordUpdate({
    config: {
      onSuccess(data) {
        if (!data.success) {
          messageApi.error(data.message);
          return;
        }

        messageApi.loading(data.message, 1).then(() => signOutFn());
      },
    },
  });

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-rich-black)] rounded-lg overflow-hidden">
      {messageHolder}
      {isChangePassword ? (
        <div className="p-4">
          <div className="text-end mb-8">
            <Button type="primary" icon={<RiArrowGoBackFill />} onClick={() => setChangePassword(false)} ghost>
              Back
            </Button>
          </div>
          <Form autoComplete="off" size="large" onFinish={(values) => passwordUpdateFn.mutate(values)}>
            <Form.Item
              name="oldPassword"
              rules={[
                {
                  required: true,
                  message: 'Please input your current password!',
                },
              ]}
            >
              <Input.Password prefix={<MdLock size={22} />} placeholder="Current Password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: 'Please input your new password!',
                },
                {
                  min: 8,
                  message: 'New password must be at least 8 characters long!',
                },
              ]}
            >
              <Input.Password prefix={<MdLock size={22} />} placeholder="New Password" />
            </Form.Item>
            <Form.Item className="!mb-0">
              <Button type="primary" htmlType="submit" loading={passwordUpdateFn.isPending} className="w-full">
                Update
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <React.Fragment>
          <div className="h-32 overflow-hidden border border-gray-300 dark:border-[var(--color-gray-700)] rounded-t-lg">
            <img className="object-cover" src="/images/profile_cover.svg" alt="" />
          </div>
          <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-gray-300 dark:border-[var(--color-gray-700)] rounded-full overflow-hidden">
            <img className="object-cover" src={ImagePaths.avatar} alt="" />
          </div>
          <div className="text-center mt-2">
            <h2 className="font-semibold">{user?.fullName}</h2>
            <p className="text-gray-500">{user?.phoneNumber || 'N/A'}</p>
            {user?.email && <p className="text-gray-500">{user?.email}</p>}
          </div>
          <div className="p-4 border-t border-gray-300 dark:border-[var(--color-gray-700)] mx-8 mt-2 text-center">
            <Button type="primary" onClick={() => setChangePassword(true)}>
              Change Password
            </Button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default ProfileCard;
