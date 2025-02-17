import { createContext } from "react";

// Create an authentication context with default values
const AuthContext = createContext({
  user: null, // Stores the authenticated user
  loading: true, // Indicates if authentication state is loading
  error: null,
  loginWithGoogle: () => Promise.resolve(),
  logout: () => Promise.resolve() // Placeholder logout function
});

export default AuthContext;