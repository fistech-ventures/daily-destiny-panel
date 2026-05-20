import { cn } from '@lib/utils';
import { Modal, type ModalProps } from 'antd';
import React from 'react';

interface IProps extends ModalProps {}

const BaseModalWithoutClicker: React.FC<IProps> = ({ width = 768, closable = true, children, ...rest }) => {
  return (
    <Modal
      {...rest}
      width={width}
      rootClassName={cn('base_modal_without_clicker', rest.rootClassName)}
      classNames={{
        ...rest.classNames,
        body: cn(
          {
            'mt-8': closable || rest.title,
          },
          rest.classNames?.body,
        ),
      }}
    >
      {children}
    </Modal>
  );
};

export default BaseModalWithoutClicker;
