import { useContext } from "react"; 
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext"; 
import googleIcon from "../assets/images/google.png"; 
 
const Login = () => { 
  const { user, loginWithGoogle, error, loading } = useContext(AuthContext); 

  if (user) {
    return <Navigate to="/" />;
  }
 
  const handleGoogleSignIn = async () => { 
    await loginWithGoogle(); 
  }; 
 
  return ( 
    <div className="container"> 
      <h2>Login</h2> 
      {error && <p className="error-message">{error}</p>} 
      <button 
        onClick={handleGoogleSignIn} 
        className="google-login-button" 
        disabled={loading} 
      > 
        <img src={googleIcon} alt="Google" className="google-icon" /> 
        Sign in with Google 
      </button> 
    </div> 
  ); 
}; 
 
export default Login;
