import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Already logged in - Go directly to Dashboard
      navigate("/dashboard");
    } else {
      // Not logged in - Go to Register page
      navigate("/register");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 text-white text-center px-4">
        <h1 className="text-6xl font-extrabold mb-4">Welcome to ProTasker 🚀</h1>
        <p className="text-lg max-w-xl">
          Manage your tasks, boost productivity, and get AI-powered insights — all in one place.
        </p>

        {/* Fixed Smart "Get Started" Button */}
        <button
          onClick={handleGetStarted}
          className="mt-6 bg-white text-purple-700 px-6 py-3 rounded-full font-semibold hover:bg-pink-100 transition-all"
        >
          Get Started
        </button>
      </div>
    </>
  );
}

export default Home;
