'use client';

import BrandLogo from '@base/components/BrandLogo';
import { Paths } from '@lib/constant';
import { useAuthSession } from '@modules/auth/lib/utils/client';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import AdBanner from '@modules/ads/components/AdBanner';
import { useAdsByPage } from '@modules/ads/lib/useAdsByPage';

const HomePage = () => {
  const router = useRouter();
  const { isLoading, isAuthenticate } = useAuthSession();
  const { adsByPosition } = useAdsByPage('homePage', 'true');

  return (
    <section>
      <div className="container">
        {/* Home-TopBanner Ad */}
        {adsByPosition['Home-TopBanner']?.[0] && (
          <div className="mb-4">
            <AdBanner ad={adsByPosition['Home-TopBanner'][0]} />
          </div>
        )}

        <div className="flex flex-col justify-center items-center min-h-screen gap-3">
          <BrandLogo />
          {/* {Env.webDescription && <p className="text-center text-gray-500">{Env.webDescription}</p>} */}
          {isLoading ||
            (isAuthenticate ? (
              <Button type="primary" onClick={() => router.push(Paths.admin.root)}>
                Go to Panel
              </Button>
            ) : (
              <Button type="primary" onClick={() => router.push(Paths.auth.signIn)}>
                Sign In
              </Button>
            ))}
        </div>

        {/* Footer-Up-Banner Ad */}
        {adsByPosition['Footer-Up-Banner']?.[0] && (
          <div className="mt-4">
            <AdBanner ad={adsByPosition['Footer-Up-Banner'][0]} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomePage;
