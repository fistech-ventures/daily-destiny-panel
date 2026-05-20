'use client';

import { ImagePaths, Paths } from '@lib/constant';
import { Button } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const NotFoundPage = () => {
  const router = useRouter();

  return (
    <section>
      <div className="container">
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 justify-center sm:items-center max-w-4xl min-h-screen py-16 mx-auto">
          <div className="space-y-2">
            <span className="font-medium text-sm text-[var(--color-primary-500)]">404</span>
            <h1 className="font-semibold text-3xl">Page not found</h1>
            <p className="text-gray-700">Sorry, the page you are looking for does not exist.</p>
            <div className="flex gap-x-2">
              <Button type="primary" onClick={router.back}>
                Go Back
              </Button>
              <Button type="primary" onClick={() => router.push(Paths.root)} ghost>
                Home
              </Button>
            </div>
          </div>
          <figure className="order-first sm:order-none">
            <Image src={ImagePaths[404]} alt="404" width="0" height="0" sizes="100vw" className="w-full h-auto" />
          </figure>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
