// src/pages/Video.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Video: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, plant } = location.state || {};

  const handleNext = () => {
    navigate('/quiz', { state: { firstName, lastName, plant } });
  };

  return (
    <div>
      <h2>Training Video</h2>
      <video width="640" height="360" controls>
        <source src="/training.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button onClick={handleNext}>Continue to Quiz</button>
    </div>
  );
};

export default Video;
