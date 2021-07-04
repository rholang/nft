import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/router';
import SearchInput from '../SearchInput';
import { Image } from '../../styles/index.styled';
import magnifyingIcon from '../../public/icon-light-search-24-px.svg';
import closeIcon from '../../public/icon-light-close-16-px.svg';
import { Effects as Fx } from 'connectors/rnode-client';
import Button from 'components/Button';

import {
  Background,
  Nav,
  NavLeftContainer,
  Section,
  AvatarContainer,
  ImageLink,
  DropdownLink,
  GradientBackground,
  DropdownList,
  MobileIcon,
  DesktopIcon,
  DesktopNavLink,
  DesktopOnlySection,
  Name,
  Subtitle,
  Balance,
  OpenSearchButton,
  UserMenuButton,
  UserMenuText,
  CloseIconButton,
} from './styled';
import { useScrollLock, useEscapeKeyClose, useWindowSize } from '../../hooks';
import { useAuthContext } from '../Provider';

import { TOKEN_SYMBOL } from '../../utils/constants';

type DropdownProps = {
  isOpen: boolean;
  closeNavDropdown: () => void;
};

const Logo = (): JSX.Element => {
  return (
    <Link href="/" passHref>
      <ImageLink>
        <DesktopIcon>
          <Image
            width="227px"
            height="54px"
            alt="logo"
            src="/beta-logo.svg" // TODO: Swap back to non-beta logo: logo-colored@3x.png
          />
        </DesktopIcon>
        <MobileIcon>
          <Image width="52px" height="52px" alt="logo" src="/logo.svg" />
        </MobileIcon>
      </ImageLink>
    </Link>
  );
};

const UserAvatar = ({ isOpen, avatar, toggleNavDropdown }) => {
  const { currentUserBalance } = useAuthContext();

  const currentUserAvatar = (
    <UserMenuButton>
      <UserMenuText>{currentUserBalance}</UserMenuText>
      <AvatarContainer>
        <Image
          alt="chain account avatar"
          src={avatar}
          width="40px"
          height="40px"
        />
      </AvatarContainer>
    </UserMenuButton>
  );

  const mobileNavbarIcon = isOpen ? (
    <CloseIconButton>
      <NextImage src={closeIcon} />
    </CloseIconButton>
  ) : (
    currentUserAvatar
  );

  return (
    <>
      <DesktopIcon onClick={toggleNavDropdown} role="button">
        {currentUserAvatar}
      </DesktopIcon>
      <MobileIcon onClick={toggleNavDropdown} role="button">
        {mobileNavbarIcon}
      </MobileIcon>
    </>
  );
};

const Dropdown = ({ isOpen, closeNavDropdown }: DropdownProps): JSX.Element => {
  const router = useRouter();
  const { currentUser, currentUserBalance, logout } = useAuthContext();
  const { isMobile, isTablet } = useWindowSize();
  useEscapeKeyClose(closeNavDropdown);

  const routes =
    isMobile || isTablet
      ? [
          {
            name: 'Explore',
            path: '/',
            onClick: closeNavDropdown,
          },
          {
            name: 'My Items',
            path: `/user/${currentUser ? currentUser.actor : ''}`,
            onClick: closeNavDropdown,
          },
          {
            name: 'Sign out',
            path: '',
            onClick: () => {
              closeNavDropdown();
              logout();
              router.push('/');
            },
            isRed: true,
          },
        ]
      : [
          {
            name: 'Sign out',
            path: '',
            onClick: () => {
              closeNavDropdown();
              logout();
              router.push('/');
            },
            isRed: true,
          },
        ];

  return (
    <DropdownList isOpen={isOpen}>
      <Name>{currentUser ? currentUser.name : ''}</Name>
      <Subtitle>Balance</Subtitle>
      <Balance>{currentUserBalance || `0.00 ${TOKEN_SYMBOL}`}</Balance>
      {routes.map(({ name, path, onClick, isRed }) =>
        path ? (
          <Link href={path} passHref key={name}>
            <DropdownLink onClick={onClick}>{name}</DropdownLink>
          </Link>
        ) : (
          <DropdownLink tabIndex={0} onClick={onClick} key={name} red={isRed}>
            {name}
          </DropdownLink>
        )
      )}
    </DropdownList>
  );
};

const DesktopNavRoutes = () => {
  const { currentUser } = useAuthContext();
  const router = useRouter();

  const routes = [
    {
      name: 'Explore',
      path: '/',
    },
    {
      name: 'My Items',
      path: `/user/${currentUser ? currentUser.actor : ''}`,
    },
    {
      name: 'Create',
      path: `/create`,
    },
  ];

  return (
    <DesktopOnlySection>
      {routes.map(({ name, path }) => {
        const isActive = router.pathname.split('/')[1] === path.split('/')[1];
        const isHidden = !currentUser;
        const refreshPage = () => router.reload();
        return isHidden ? null : (
          <Link href={path} passHref key={name}>
            <DesktopNavLink
              isActive={isActive}
              onClick={isActive ? refreshPage : null}>
              {name}
            </DesktopNavLink>
          </Link>
        );
      })}
    </DesktopOnlySection>
  );
};

export const View = (): JSX.Element => {
  const { currentUser, login } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginDisabled, setIsLoginDisabled] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  useScrollLock(isOpen);

  const toggleNavDropdown = () => setIsOpen(!isOpen);

  const closeNavDropdown = () => setIsOpen(false);

  const addWallet = () => {
    Fx.addWalletFx();
  };

  const mobileSearchHiddenNavItems = isMobileSearchOpen ? null : (
    <>
      <OpenSearchButton onClick={() => setIsMobileSearchOpen(true)}>
        <NextImage src={magnifyingIcon} />
      </OpenSearchButton>
      {currentUser && currentUser.avatar ? (
        <UserAvatar
          isOpen={isOpen}
          avatar={currentUser.avatar}
          toggleNavDropdown={toggleNavDropdown}
        />
      ) : (
        <>
          <Button onClick={addWallet}>Connect Wallet</Button>
        </>
      )}
    </>
  );

  return (
    <Background>
      <Nav>
        <NavLeftContainer>
          <Logo />
          <SearchInput
            isMobileSearchOpen={isMobileSearchOpen}
            closeMobileSearch={() => setIsMobileSearchOpen(false)}
          />
        </NavLeftContainer>
        <Section>
          <DesktopNavRoutes />
          {mobileSearchHiddenNavItems}
        </Section>
        <Dropdown isOpen={isOpen} closeNavDropdown={closeNavDropdown} />
        <GradientBackground isOpen={isOpen} onClick={closeNavDropdown} />
      </Nav>
    </Background>
  );
};
