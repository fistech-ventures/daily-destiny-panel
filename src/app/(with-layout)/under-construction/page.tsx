import { ImagePaths } from '@lib/constant';
import Image from 'next/image';

const UnderConstructionPage = () => {
  return (
    <section>
      <div className="container">
        <Image
          src={ImagePaths.underConstruction}
          alt="under construction"
          width={0}
          height={0}
          sizes="100vw"
          className="w-96 h-auto mx-auto"
        />
      </div>
    </section>
  );
};

export default UnderConstructionPage;
