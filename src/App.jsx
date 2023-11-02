import Header from './components/header';
import { Outlet } from 'react-router-dom';
import './App.css';
import Aside from './components/aside';

function App() {

  return (
    <>
      <Header/>
      <Aside/>
      <main className='main'>
        <Outlet/>
      </main>
    </>
  )
}

export default App
