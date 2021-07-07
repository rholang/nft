import { useInView } from 'react-intersection-observer';
import { Button } from './PaginationButton.styled';
import arrowIcon from '../../public/arrow.svg';
import loadingIcon from '../../public/loading.svg';
import Image from 'next/image';
import { useEffect } from 'react';

type Props = {
  onClick: () => Promise<void>;
  disabled: boolean;
  isLoading: boolean;
  isHidden?: boolean;
  autoLoad?: boolean;
};

const PaginationButton = ({
  onClick,
  disabled,
  isLoading,
  isHidden,
  autoLoad,
}: Props): JSX.Element => {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (autoLoad && inView && !isLoading && !isHidden) {
      onClick();
    }
  }, [inView]);

  return (
    <Button
      ref={ref}
      aria-label="Next page"
      onClick={onClick}
      disabled={disabled || isLoading}
      isHidden={isHidden || (disabled && !isLoading)}>
      {isLoading ? <Image src={loadingIcon} /> : <Image src={arrowIcon} />}
    </Button>
  );
};

export default PaginationButton;
