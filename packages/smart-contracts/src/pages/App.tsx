import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
// import { ResetCSS } from '@pancakeswap-libs/uikit'
// import GlobalStyle from './style/Global'

// import Providers from './Providers'

/* if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
} */

const root = document.getElementById('root') as HTMLElement
ReactDOM.unstable_createRoot(root).render(
    <StrictMode>
        <div>test</div>
    </StrictMode>
)
