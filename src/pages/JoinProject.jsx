import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import API from "../api/axios";

function JoinProject() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const joinProject = async () => {
      try {
        const res = await API.post(`/projects/join/${inviteCode}`);
        alert(res.data.message || "Joined project successfully!");
        navigate("/projects");
      } catch (err) {
        alert(" Invalid or expired invite link");
        navigate("/projects");
      }
    };
    joinProject();
  }, [inviteCode, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-purple-100">
      <div className="p-6 bg-white rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-semibold text-purple-600 mb-2">
          Joining Project...
        </h2>
        <p>Please wait a moment.</p>
      </div>
    </div>
  );
}

export default JoinProject;
