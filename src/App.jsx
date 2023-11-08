import Header from './components/header';
import { Outlet, useLoaderData } from 'react-router-dom';
import Aside from './components/aside';
import './App.css';

const App = () => {
  const dataStore = useLoaderData();

  return (
    <>
      <Header dataStore={dataStore}/>
      <Aside dataStore={dataStore} requests={dataStore.requests} removeRequest={(id) => dataStore.removeRequest(id)} />
      <main className='main'>
        <Outlet context={dataStore}/>
      </main>
    </>
  )
};

export default App;
