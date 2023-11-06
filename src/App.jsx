import Header from './components/header';
import { Outlet, useLoaderData } from 'react-router-dom';
import Aside from './components/aside';
import { observer } from 'mobx-react-lite';
import './App.css';

const App = observer(() => {
  const dataStore = useLoaderData();
  console.log(dataStore);
  return (
    <>
      <Header/>
      <Aside requests={dataStore.requests} removeRequest={(id) => dataStore.removeRequest(id)} />
      <main className='main'>
        <Outlet/>
      </main>
    </>
  )
});

export default App
