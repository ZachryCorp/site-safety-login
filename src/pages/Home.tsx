// src/pages/Home.tsx - Fixed version with working training button and re-login capability

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    plant: 'Cement',
    email: '',
    phone: '',
    meetingWith: ''
  });
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [hasTrainingCompleted, setHasTrainingCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkExistingUser = async (email: string) => {
    if (!email) return;
    
    try {
      const response = await fetch(`https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net/api/check-user?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setIsReturningUser(true);
          setHasTrainingCompleted(data.trainingCompleted);
          // Pre-fill form with existing user data
          setFormData(prev => ({
            ...prev,
            firstName: data.user.firstName || prev.firstName,
            lastName: data.user.lastName || prev.lastName,
            plant: data.user.plant || prev.plant,
            phone: data.user.phone || prev.phone,
            meetingWith: data.user.meetingWith || prev.meetingWith
          }));
        } else {
          setIsReturningUser(false);
          setHasTrainingCompleted(false);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create or update user record
      const response = await fetch(`https://site-safety-login-linux-bmg9dff8a9g6ahej.centralus-01.azurewebsites.net/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          signedOutAt: null // Clear any previous sign-out time for re-login
        })
      });

      if (response.ok) {
        // Store email for later use
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
        
        // Navigate based on training status
        if (hasTrainingCompleted) {
          // User already completed training, go straight to thank you
          navigate('/thank-you');
        } else {
          // New user or user who hasn't completed training, go to video
          navigate('/video');
        }
      } else {
        alert('Error submitting form. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle the Site Specific Training button
  const handleTrainingClick = () => {
    // Save current form data to localStorage in case they started filling it out
    if (formData.email) {
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
    }
    
    // Navigate to video page
    navigate('/video');
  };

  // Handle Admin Portal button
  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Site Safety Sign-In</h1>
      
      <form onSubmit={handleSubmit} style={{ 
        background: '#f9f9f9', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => {
              handleChange(e);
              checkExistingUser(e.target.value);
            }}
            required
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          {isReturningUser && (
            <p style={{ 
              color: hasTrainingCompleted ? '#4CAF50' : '#FF9800', 
              fontSize: '0.9rem',
              marginTop: '0.5rem'
            }}>
              {hasTrainingCompleted 
                ? '✓ Welcome back! Your training is complete. Just update your visit details.'
                : '⚠ Welcome back! Please complete the training after signing in.'}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Plant *
          </label>
          <select
            name="plant"
            value={formData.plant}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="Cement">Cement</option>
            <option value="Aggregate">Aggregate</option>
            <option value="RMC">RMC</option>
            <option value="Contractor/Vendor">Contractor/Vendor</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Who are you meeting with?
          </label>
          <input
            type="text"
            name="meetingWith"
            value={formData.meetingWith}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : (hasTrainingCompleted ? 'Sign In' : 'Sign In and Start Training')}
        </button>
      </form>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem',
        background: '#fff',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          First time visitor? Click below to view the training directly:
        </p>
        <button
          onClick={handleTrainingClick}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
           Site Specific Training
        </button>

        <button
          onClick={handleAdminClick}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#FF9800',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
           Admin Portal
        </button>
      </div>
    </div>
  );
};

export default Home;