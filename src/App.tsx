import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Video from './pages/Video';
import Quiz from './pages/Quiz';
import ThankYou from './pages/ThankYou';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<Video />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </Router>
  );
}

export default App;
