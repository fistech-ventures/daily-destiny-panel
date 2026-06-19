import { Modal } from 'antd';
import React from 'react';

interface IProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'success' | 'error';
}

const ConfirmationDialog: React.FC<IProps> = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
}) => {
  return (
    <Modal
      open={open}
      title={title}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger: type === 'warning' || type === 'error' }}
    >
      <p>{content}</p>
    </Modal>
  );
};

export default ConfirmationDialog;
