import Header from './components/header';
import { Outlet, useLoaderData } from 'react-router-dom';
import Aside from './components/aside';
import './App.css';
import { observer } from 'mobx-react-lite';

const App = observer(() => {
  const dataStore = useLoaderData();

  return (
    <>
      <Header dataStore={dataStore}/>
      <Aside dataStore={dataStore} requests={dataStore.requests} />
      <main className='main'>
        <Outlet context={dataStore}/>
      </main>
    </>
  )
});

export default App;
