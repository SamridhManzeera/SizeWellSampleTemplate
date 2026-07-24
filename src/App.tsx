import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import { store, persistor } from './Store';
import RootRouter from './Routes/RootRouter';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

const baseName = import.meta.env.VITE_BASE_NAME;

function App() {
  console.log("Branch:Two add")
  // const [count, setCount] = useState<number>(0);
  console.log("1.1");
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <HelmetProvider>
          <BrowserRouter basename={baseName}>
            <RootRouter />
          </BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
        </HelmetProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
