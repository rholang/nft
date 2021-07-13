import { useState, useEffect } from "react";
import { Title } from "../styles/Title.styled";
import PageLayout from "../components/PageLayout";
import ExploreCard from "../components/ExploreCard";
import Banner from "../components/Banner";
import HomepageStatistics from "../components/HomepageStatistics";
import { MODAL_TYPES } from "../components/Provider";
import FeaturedCarousel from "../components/FeaturedCarousel";

import Grid from "../components/Grid";
import { getTemplatesByCollection, Template } from "../services/templates";

const MarketPlace = (): JSX.Element => (
  <PageLayout>
    <Banner modalType={MODAL_TYPES.CLAIM} />
    <ExploreCard />
    <HomepageStatistics />
    <Title>New &amp; Noteworthy</Title>
    <FeaturedCarousel collection="ezze" />
  </PageLayout>
);

export default MarketPlace;
