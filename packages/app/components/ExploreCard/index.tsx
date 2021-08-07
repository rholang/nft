import { useRouter } from "next/router";
import Image from "next/image";
import { Effects as Fx } from "@rholang/connectors";
import { checkBalance, insertRegistry } from "@rholang/sdk";

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
      client: "cf",
      code: checkBalance({
        account: "111125rrPWgw5tGQWEHFW9ByFeLvHTkTSWFcvfsPVFxZnCgMZ4crL1",
      }),
    });
  };

  const handleDeploy = () => {
    Fx.deployFx({
      client: "rnode",
      code: insertRegistry({}),
      phloLimit: "5000000",
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
