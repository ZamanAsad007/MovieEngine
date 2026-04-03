import "./css/App.css";
import MovieCard from './components/movieCard.jsx';
import Home from './pages/Home.jsx';
import { Routes, Route } from 'react-router-dom'
import Favourite from './pages/Favourite.jsx';
import Watched from './pages/Watched.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NavBar from './components/NavBar.jsx';
import {MovieProvider} from './contexts/MovieContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { UiProvider } from './contexts/UiContext.jsx';
import AuthRequiredModal from './components/AuthRequiredModal.jsx';

function App() {


  return (
    <UiProvider>
      <AuthProvider>
        <MovieProvider>
          <NavBar />
          <AuthRequiredModal />
          <main className='main-content'>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/favourites" element={<Favourite />} />
              <Route path="/watched" element={<Watched />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </MovieProvider>
      </AuthProvider>
    </UiProvider>
  )
}

export default App;
