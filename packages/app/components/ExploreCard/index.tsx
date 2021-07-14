import { useRouter } from "next/router";
import Image from "next/image";
import { Effects as Fx, checkBalance, insertRegistry } from "@rholang/sdk";

import Link from "next/link";

import Button from "../Button";
import { useWindowSize } from "../../hooks";
import { useAuthContext } from "../Provider";

import {
  Container,
  Content,
  Title,
  SubTitle,
  ImageContainer,
  ButtonWrapper,
} from "./ExploreCard.styled";
import exploreIcon from "../../public/Explore.png";
import exploreMobileIcon from "../../public/ExploreMobile.png";

const ExploreCard = (): JSX.Element => {
  const router = useRouter();
  const { isMobile } = useWindowSize();
  const { currentUser, login } = useAuthContext();

  const handleExploreDeploy = () => {
    Fx.exploreDeployFx({
      client: "rnode",
      code: checkBalance(
        "1111yNahhR8CYJ7ijaJsyDU4zzZ1CrJgdLZtK4fve7zifpDK3crzZ"
      ),
    });
  };

  const handleDeploy = () => {
    Fx.deployFx({
      client: "rnode",
      code: insertRegistry(),
      phloLimit: "500000",
    });
  };

  return (
    <Container>
      <Content>
        <Title>Start creating and selling your own NFTs!</Title>
        <SubTitle>
          The best way to monetize your talent. Free to get started.
        </SubTitle>
        <ButtonWrapper>
          <Button
            fullWidth
            margin="0"
            smallSize={isMobile}
            onClick={handleExploreDeploy}
          >
            Explore deploy
          </Button>
          <Button
            fullWidth
            margin="0"
            smallSize={isMobile}
            onClick={handleDeploy}
          >
            Deploy
          </Button>
        </ButtonWrapper>
      </Content>
      <ImageContainer>
        {isMobile ? (
          <Image
            width="875px"
            height="430px"
            alt="ExploreMobile"
            src={exploreMobileIcon}
            placeholder="blur"
            unoptimized
          />
        ) : (
          <Image
            width="672px"
            height="320px"
            alt="Explore"
            src={exploreIcon}
            placeholder="blur"
            unoptimized
          />
        )}
      </ImageContainer>
    </Container>
  );
};

export default ExploreCard;
