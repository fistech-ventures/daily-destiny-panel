import { cn } from '@lib/utils';
import { Modal, type ModalProps } from 'antd';
import React, { useState } from 'react';

interface IProps extends ModalProps {
  clickerElement: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
}

const BaseModalWithClicker: React.FC<IProps> = ({
  width = 768,
  closable = true,
  clickerElement,
  children,
  ...rest
}) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOnCancelFn = (e) => {
    setModalOpen(false);

    if (rest.onCancel) {
      rest.onCancel(e);
    }
  };

  const handleClickFn = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <React.Fragment>
      {React.cloneElement(clickerElement, { onClick: (e) => handleClickFn(e) })}
      <Modal
        {...rest}
        width={width}
        open={isModalOpen}
        onCancel={handleOnCancelFn}
        rootClassName={cn('base_modal_with_clicker', rest.rootClassName)}
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
    </React.Fragment>
  );
};

export default BaseModalWithClicker;
