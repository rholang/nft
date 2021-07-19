import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import type { AppProps } from "next/app";
import Router from "next/router";
import NProgress from "nprogress";
import SimpleReactLightbox from "simple-react-lightbox";
import "styles/reset.css";
import "styles/globals.css";
import { NavBar } from "components/NavBar";
import Footer from "components/Footer";
import {
  AuthProvider,
  ModalProvider,
  CreateAssetProvider,
} from "components/Provider";
import "styles/customprogress.css";
import { detectEnvironement } from "utils/node";

NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 800,
  showSpinner: false,
});

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useEffect(() => {
    detectEnvironement();
  }, []);
  return (
    <SimpleReactLightbox>
      <ModalProvider>
        <AuthProvider>
          <CreateAssetProvider>
            <NavBar />
            <Component {...pageProps} />
            {/* <Footer /> */}
          </CreateAssetProvider>
        </AuthProvider>
      </ModalProvider>
    </SimpleReactLightbox>
  );
}

export default MyApp;
