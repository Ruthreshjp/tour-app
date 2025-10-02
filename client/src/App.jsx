import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import axios from "axios";

// Import styles
import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  // Configure axios defaults
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;

  return <RouterProvider router={router} />;
};

export default App;