import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import Layout from '../Layout';

import ReduxWrapper from '../redux/store';
import '../styles/globals.css'

function MyApp({ Component, pageProps, reduxStore }) {
  return (
    <Provider store={reduxStore}>
      <PersistGate
        loading={null}
        persistor={persistStore(reduxStore)}
      >
        <Layout>
            <Component {...pageProps} />
        </Layout>
      </PersistGate>
    </Provider>
  )
}

export default ReduxWrapper(MyApp);
