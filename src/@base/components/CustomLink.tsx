import { cn } from '@lib/utils';
import { message } from 'antd';
import Link, { type LinkProps } from 'next/link';
import React from 'react';

interface IBaseProps extends LinkProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  disabledClassName?: string;
  disabled?: boolean;
  waitableMessage?: string;
}

interface IBasePropsWithTitle extends IBaseProps {
  type: 'hoverable';
  title: string;
}

interface IBasePropsWithChildren extends IBaseProps {
  type?: 'primary' | 'waitable';
  children: React.ReactNode;
}

type TProps = IBasePropsWithTitle | IBasePropsWithChildren;

const CustomLink = React.forwardRef<HTMLAnchorElement, TProps>(
  (
    { className, disabledClassName, type = 'primary', disabled = false, waitableMessage, title, children, ...rest },
    ref,
  ) => {
    const [messageApi, messageHolder] = message.useMessage();

    return (
      <React.Fragment>
        {messageHolder}
        <Link
          {...rest}
          ref={ref}
          href={disabled ? '#' : rest.href}
          onClick={
            disabled
              ? (e) => e.preventDefault()
              : type === 'waitable'
                ? (e) => {
                    e.preventDefault();
                    messageApi
                      .loading(waitableMessage || 'You are being redirected...', 1)
                      .then(() => window.open(rest.href as string, rest.target || '_self'));
                  }
                : rest.onClick
                  ? rest.onClick
                  : null
          }
          className={cn(
            'inline-block',
            { 'absolute top-0 left-0 z-10 w-full h-full opacity-0': type === 'hoverable' },
            'custom_link',
            className,
            { [disabledClassName]: disabled },
          )}
        >
          {title || children}
        </Link>
      </React.Fragment>
    );
  },
);

CustomLink.displayName = 'CustomLink';

export default CustomLink;
