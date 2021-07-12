import { useRouter } from 'next/router'
import Image from 'next/image'
import { Effects as Fx } from 'connectors/rnode-client'
import { read_purses } from '@nftland/contracts'

import Link from 'next/link'
import Button from '../Button'
import { useWindowSize } from '../../hooks'
import { useAuthContext } from '../Provider'

import {
    Container,
    Content,
    Title,
    SubTitle,
    ImageContainer,
    ButtonWrapper,
} from './ExploreCard.styled'
import exploreIcon from '../../public/Explore.png'
import exploreMobileIcon from '../../public/ExploreMobile.png'

console.log('tt')
console.log(read_purses('ab', 'cd'))

const ExploreCard = (): JSX.Element => {
    const router = useRouter()
    const { isMobile } = useWindowSize()
    const { currentUser, login } = useAuthContext()

    const handleExploreDeploy = () => {
        Fx.exploreDeployFx({ client: 'cf', code: 'checkAccount' })
    }

    const handleDeploy = () => {
        Fx.deployFx({
            client: 'rnode',
            code: 'sampleInsertToRegistry',
            phloLimit: '500000',
        })
    }

    return (
        <Container>
            <Content>
                <Title>Start creating and selling your own NFTs!</Title>
                <SubTitle>The best way to monetize your talent. Free to get started.</SubTitle>
                <ButtonWrapper>
                    <Button fullWidth margin="0" smallSize={isMobile} onClick={handleExploreDeploy}>
                        Explore deploy
                    </Button>
                    <Button fullWidth margin="0" smallSize={isMobile} onClick={handleDeploy}>
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
    )
}

export default ExploreCard
