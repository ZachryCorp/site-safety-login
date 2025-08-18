import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Video from './pages/Video';
import Quiz from './pages/Quiz';
import ThankYou from './pages/ThankYou';
import Admin from './pages/admin';
import SignOut from './pages/SignOut';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<Video />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/sign-out" element={<SignOut />} />
      </Routes>
    </Router>
  );
}

export default App;


