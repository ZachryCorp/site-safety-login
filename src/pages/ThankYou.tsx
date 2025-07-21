// src/pages/ThankYou.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const location = useLocation();
  const existing = new URLSearchParams(location.search).get('existing') === 'true';

  return (
    <div>
      <h1>Thank You</h1>
      {existing ? (
        <p>You have successfully signed in today.</p>
      ) : (
        <p>You have been added to the database. Welcome!</p>
      )}
    </div>
  );
};

export default ThankYou;
