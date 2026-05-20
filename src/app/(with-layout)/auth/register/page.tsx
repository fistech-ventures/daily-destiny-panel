'use client';

import { LoadingOutlined } from '@ant-design/icons';
import { Paths } from '@lib/constant';
import SignUpSection from '@modules/auth/components/SignUpSection';
import { AuthServices } from '@modules/auth/lib/services';
import { Spin } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

const fullPageSpin = (
  <div className="flex min-h-screen items-center justify-center">
    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
  </div>
);

const SignUpPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!hash) {
      router.replace(Paths.auth.signIn);
      return;
    }

    const validateSignUpLink = async () => {
      try {
        const isExistQuery = await AuthServices.signUpLinkExist({ hash });

        if (!isMounted) return;

        if (!isExistQuery.data.isExist) {
          router.replace(Paths.auth.signIn);
          return;
        }

        setIsAllowed(true);
      } catch {
        if (!isMounted) return;
        router.replace(Paths.auth.signIn);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    validateSignUpLink();

    return () => {
      isMounted = false;
    };
  }, [hash, router]);

  if (isChecking || !isAllowed || !hash) return fullPageSpin;

  return <SignUpSection hash={hash} />;
};

const SignUpPage = () => {
  return (
    <Suspense fallback={fullPageSpin}>
      <SignUpPageContent />
    </Suspense>
  );
};

export default SignUpPage;
