import { useState, useEffect, FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Wallet, Effects as Fx } from "@rholang/connectors";
import Button from "components/Button";
import SearchInput from "../SearchInput";
import magnifyingIcon from "../../public/icon-light-search-24-px.png";
import closeIcon from "../../public/icon-light-close-16-px.svg";

import userIcon from "../../public/user.png";
import betaIcon from "../../public/beta-logo.png";
import logoIcon from "../../public/logo.png";

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
  DesktopLogoIcon,
  DesktopNavLink,
  DesktopOnlySection,
  Name,
  Subtitle,
  Balance,
  OpenSearchButton,
  UserMenuButton,
  UserMenuText,
  CloseIconButton,
} from "./styled";
import { useScrollLock, useEscapeKeyClose, useWindowSize } from "../../hooks";
import { useAuthContext } from "../Provider";

import { TOKEN_SYMBOL } from "../../utils/constants";

type DropdownProps = {
  isOpen: boolean;
  closeNavDropdown: () => void;
};

const Logo = (): JSX.Element => (
  <Link href="/" passHref>
    <ImageLink>
      <DesktopIcon>
        <DesktopLogoIcon>
          <Image
            width="222px"
            height="55px"
            alt="logo"
            placeholder="blur"
            src={betaIcon}
            unoptimized // TODO: Swap back to non-beta logo: logo-colored@3x.png
          />
        </DesktopLogoIcon>
      </DesktopIcon>
      <MobileIcon>
        <Image
          width="52px"
          placeholder="blur"
          unoptimized
          height="52px"
          alt="logo"
          src={logoIcon}
        />
      </MobileIcon>
    </ImageLink>
  </Link>
);

const UserAvatar = ({ isOpen, toggleNavDropdown }) => {
  const { currentUserBalance } = useAuthContext();

  const currentUserAvatar = (
    <UserMenuButton>
      <UserMenuText>Connected</UserMenuText>
      <AvatarContainer>
        <Image
          alt="chain account avatar"
          src={userIcon}
          width="60px"
          placeholder="blur"
          height="60px"
          unoptimized
        />
      </AvatarContainer>
    </UserMenuButton>
  );

  const mobileNavbarIcon = isOpen ? (
    <CloseIconButton>
      <Image src={closeIcon} />
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
            name: "Explore",
            path: "/",
            onClick: closeNavDropdown,
          },
          {
            name: "My Items",
            path: `/user/${currentUser ? currentUser.actor : ""}`,
            onClick: closeNavDropdown,
          },
          {
            name: "Sign out",
            path: "",
            onClick: () => {
              closeNavDropdown();
              logout();
              router.push("/");
            },
            isRed: true,
          },
        ]
      : [
          {
            name: "Sign out",
            path: "",
            onClick: () => {
              closeNavDropdown();
              logout();
              router.push("/");
            },
            isRed: true,
          },
        ];

  return (
    <DropdownList isOpen={isOpen}>
      <Name>{currentUser ? currentUser.name : ""}</Name>
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
      name: "Explore",
      path: "/",
    },
    {
      name: "My Items",
      path: `/user/${currentUser ? currentUser.actor : ""}`,
    },
    {
      name: "Create",
      path: `/create`,
    },
  ];

  return (
    <DesktopOnlySection>
      {routes.map(({ name, path }) => {
        const isActive = router.pathname.split("/")[1] === path.split("/")[1];
        const isHidden = !currentUser;
        const refreshPage = () => router.reload();
        return isHidden ? null : (
          <Link href={path} passHref key={name}>
            <DesktopNavLink
              isActive={isActive}
              onClick={isActive ? refreshPage : null}
            >
              {name}
            </DesktopNavLink>
          </Link>
        );
      })}
    </DesktopOnlySection>
  );
};

type InputProps = {
  wallet: Wallet;
  onChange?: () => any;
};

export const View: FC<InputProps> = ({ wallet }): JSX.Element => {
  const { walletConnected } = wallet;

  const { login } = useAuthContext();
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
        <Image src={magnifyingIcon} placeholder="blur" unoptimized />
      </OpenSearchButton>
      {walletConnected ? (
        <UserAvatar isOpen={isOpen} toggleNavDropdown={toggleNavDropdown} />
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
