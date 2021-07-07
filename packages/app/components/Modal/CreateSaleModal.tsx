import {
  useEffect,
  useState,
  MouseEvent,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  useAuthContext,
  useModalContext,
  CreateSaleModalProps,
  CreateMultipleSalesModalProps,
} from '../Provider';
import InputField from '../InputField';
import {
  Background,
  ModalBox,
  Section,
  CloseIconContainer,
  Title,
  Description,
  HalfButton,
  FeeLabel,
} from './Modal.styled';
import closeIcon from '../../public/close.svg';
import Image from 'next/image';
import {
  TOKEN_SYMBOL,
  TOKEN_PRECISION,
  RAM_AMOUNTS,
} from '../../utils/constants';
import ProtonSDK from '../../services/proton';
import { useWindowSize } from '../../hooks';
import fees, { ListingFee } from '../../services/fees';

type Props = {
  title: string;
  description: string;
  buttonText: string;
  amount: string;
  listingFee: ListingFee;
  numSales: number;
  onButtonClick: () => Promise<void>;
  setAmount: Dispatch<SetStateAction<string>>;
  setListingFee: Dispatch<SetStateAction<ListingFee>>;
};

const SaleModal = ({
  title,
  description,
  buttonText,
  amount,
  listingFee,
  numSales,
  setAmount,
  onButtonClick,
  setListingFee,
}: Props): JSX.Element => {
  const { closeModal } = useModalContext();
  const { currentUser } = useAuthContext();
  const { isMobile } = useWindowSize();
  const isInvalid =
    !amount ||
    isNaN(parseFloat(amount)) ||
    parseFloat(amount) === 0 ||
    parseFloat(amount) > 1000000000;

  useEffect(() => {
    const fee = fees.calculateFee({
      numAssets: numSales,
      actor: currentUser ? currentUser.actor : '',
      ramCost: RAM_AMOUNTS.LIST_SALE,
    });
    setListingFee(fee);
  }, [numSales, currentUser]);

  const handleBackgroundClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const getFee = () => (
    <FeeLabel>
      <span>Listing Fee</span>
      <span>≈ {listingFee.display} XUSDC</span>
    </FeeLabel>
  );

  return (
    <Background onClick={handleBackgroundClick}>
      <ModalBox>
        <Section>
          <Title>{title}</Title>
          <CloseIconContainer role="button" onClick={closeModal}>
            <Image src={closeIcon} />
          </CloseIconContainer>
        </Section>
        <Description>{description}</Description>
        <InputField
          inputType="number"
          min={0}
          max={1000000000}
          step={1 / 10 ** TOKEN_PRECISION}
          value={amount}
          setValue={setAmount}
          submit={isInvalid ? null : onButtonClick}
          placeholder={`Enter amount in ${TOKEN_SYMBOL}`}
          onBlur={() => {
            const numberAmount = parseFloat(amount).toFixed(TOKEN_PRECISION);
            setAmount(numberAmount);
          }}
          checkIfIsValid={(input) => {
            const floatAmount = parseFloat(input as string);
            const isValid = floatAmount > 0 && floatAmount <= 1000000000;
            const errorMessage = `Sales price must be between 0 ${TOKEN_SYMBOL} and 1,000,000,000 ${TOKEN_SYMBOL}.`;
            return {
              isValid,
              errorMessage,
            };
          }}
        />
        {getFee()}
        <HalfButton
          disabled={isInvalid}
          fullWidth={isMobile}
          margin="24px 0 0"
          onClick={onButtonClick}>
          {buttonText}
        </HalfButton>
      </ModalBox>
    </Background>
  );
};

export const CreateSaleModal = (): JSX.Element => {
  const { currentUser } = useAuthContext();
  const { closeModal, modalProps } = useModalContext();
  const { assetId, fetchPageData } = modalProps as CreateSaleModalProps;
  const [amount, setAmount] = useState<string>('');
  const [listingFee, setListingFee] = useState<ListingFee>({
    display: '0.00',
    raw: null,
  });

  const createOneSale = async () => {
    try {
      const formattedAmount = parseFloat(amount).toFixed(TOKEN_PRECISION);
      await fees.refreshRamInfoForUser(currentUser.actor);
      const finalFee = fees.calculateFee({
        numAssets: 1,
        actor: currentUser ? currentUser.actor : '',
        ramCost: RAM_AMOUNTS.LIST_SALE,
      });
      const res = await ProtonSDK.createSale({
        seller: currentUser ? currentUser.actor : '',
        asset_id: assetId,
        price: `${formattedAmount} ${TOKEN_SYMBOL}`,
        currency: `${TOKEN_PRECISION},${TOKEN_SYMBOL}`,
        listing_fee: finalFee.raw,
      });

      if (res.success) {
        closeModal();
        fetchPageData();
      }
    } catch (err) {
      console.warn(err.message);
    }
  };

  return (
    <SaleModal
      numSales={1}
      title="Listing Price"
      description="Enter the amount you want to sell your NFT for."
      buttonText="Mark for sale"
      amount={amount}
      listingFee={listingFee}
      setAmount={setAmount}
      setListingFee={setListingFee}
      onButtonClick={createOneSale}
    />
  );
};

export const CreateMultipleSalesModal = (): JSX.Element => {
  const { currentUser } = useAuthContext();
  const { closeModal, modalProps } = useModalContext();
  const {
    assetIds,
    fetchPageData,
    setIsModalWithFeeOpen,
  } = modalProps as CreateMultipleSalesModalProps;
  const [amount, setAmount] = useState<string>('');
  const [listingFee, setListingFee] = useState<ListingFee>({
    display: '0.00',
    raw: null,
  });
  const numSales = assetIds.length;

  const createMultipleSales = async () => {
    try {
      const formattedAmount = parseFloat(amount).toFixed(TOKEN_PRECISION);
      await fees.refreshRamInfoForUser(currentUser.actor);
      const finalFee = fees.calculateFee({
        numAssets: numSales,
        actor: currentUser ? currentUser.actor : '',
        ramCost: RAM_AMOUNTS.LIST_SALE,
      });
      const res = await ProtonSDK.createMultipleSales({
        seller: currentUser ? currentUser.actor : '',
        assetIds,
        price: `${formattedAmount} ${TOKEN_SYMBOL}`,
        currency: `${TOKEN_PRECISION},${TOKEN_SYMBOL}`,
        listing_fee: finalFee.raw,
      });

      if (res.success) {
        closeModal();
        setIsModalWithFeeOpen(false);
        fetchPageData();
      }
    } catch (err) {
      console.warn(err.message);
    }
  };

  return (
    <SaleModal
      numSales={numSales}
      title="Listing Price"
      description={`You are putting up ${numSales} items for sale. Enter the amount you want to sell each of your NFTs for.`}
      buttonText="Mark all for sale"
      amount={amount}
      listingFee={listingFee}
      setAmount={setAmount}
      setListingFee={setListingFee}
      onButtonClick={createMultipleSales}
    />
  );
};

SaleModal.defaultProps = {
  listingFee: 0,
};
