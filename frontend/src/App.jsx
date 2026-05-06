import "./css/App.css";
import Home from './pages/Home.jsx';
import { Routes, Route } from 'react-router-dom'
import Favourite from './pages/Favourite.jsx';
import Watched from './pages/Watched.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ResendVerification from "./pages/ResendVerification.jsx";
import About from './pages/About.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';
import PublicProfile from './pages/PublicProfile.jsx';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import FloatingAI from './components/FloatingAI.jsx';
import AIChatSidebar from './components/AIChatSidebar.jsx';
import {MovieProvider} from './contexts/MovieContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { UiProvider } from './contexts/UiContext.jsx';
import AuthRequiredModal from './components/AuthRequiredModal.jsx';
import ScrollRestoration from './components/ScrollRestoration.jsx';
import { useState } from 'react';

function App() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <UiProvider>
      <AuthProvider>
        <MovieProvider>
          <ScrollRestoration />
          <NavBar />
          <AuthRequiredModal />
          <AIChatSidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} />
          {!aiOpen && <FloatingAI onOpen={() => setAiOpen(true)} />}
          <main className='main-content'>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/tv/:id" element={<MovieDetail mediaType="tv" />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/u/:username" element={<PublicProfile />} />
              <Route path="/favourites" element={<Favourite />} />
              <Route path="/watched" element={<Watched />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<VerifyEmail />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>
          <Footer />
        </MovieProvider>
      </AuthProvider>
    </UiProvider>
  )
}

export default App;
