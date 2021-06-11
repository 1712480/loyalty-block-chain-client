import LayoutContainer from '../LayoutContainer';

import '../../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <LayoutContainer>
      <Component {...pageProps} />
    </LayoutContainer>
  )
}

export default MyApp
