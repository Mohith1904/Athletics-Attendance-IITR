import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import googleIcon from "../assets/images/google.png";
import iitRoorkeeImage from "../assets/images/IITR1.jpg"; // Add your IIT Roorkee image here

const Login = () => {
  const { user, loginWithGoogle, error, loading } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleGoogleSignIn = async () => {
    await loginWithGoogle();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Subtle Pattern Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        zIndex: 1
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        margin: '20px',
        backgroundImage: `url(${iitRoorkeeImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        animation: isVisible ? 'bounceIn 1s ease-out' : 'none'
      }}>
        {/* Semi-transparent overlay for text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
          borderRadius: '20px',
          zIndex: 1
        }} />

        {/* Card Content */}
        <div style={{
          position: 'relative',
          zIndex: 2
        }}>
          {/* Logo/Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          animation: 'slideDown 1s ease-out 0.2s both'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '10px',
            animation: 'bounce 2s infinite'
          }}>
            🏃‍♂️
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            margin: '0',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 'bold'
          }}>
            Athletics IITR
          </h1>
          <p style={{
            color: '#666',
            margin: '10px 0 0 0',
            fontSize: '1.1rem'
          }}>
            Track Your Progress, Stay Committed!
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          animation: 'slideUp 1s ease-out 0.4s both'
        }}>
          <h2 style={{
            textAlign: 'center',
            color: '#333',
            marginBottom: '30px',
            fontSize: '1.8rem'
          }}>
            Welcome Back
          </h2>

          {error && (
            <div style={{
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              textAlign: 'center',
              animation: 'shake 0.5s ease-in-out'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            <img
              src={googleIcon}
              alt="Google"
              style={{
                width: '20px',
                height: '20px',
                filter: 'brightness(0) invert(1)'
              }}
            />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <p style={{
            textAlign: 'center',
            marginTop: '25px',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Join the Athletics community at IIT Roorkee
          </p>
        </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
