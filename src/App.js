import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TaskView from "./pages/TaskView";
import ProjectDashboard from "./pages/ProjectDashboard";
import ProjectChat from "./pages/ProjectChat";
import JoinProject from "./pages/JoinProject";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard" element={<TaskView filterType="All" />} />
      <Route path="/dashboard/pending" element={<TaskView filterType="Pending" />} />
      <Route path="/dashboard/completed" element={<TaskView filterType="Completed" />} />
      <Route path="/projects" element={<ProjectDashboard />} />
      <Route path="/projects/:id/chat" element={<ProjectChat />} />
      <Route path="/join/:inviteCode" element={<JoinProject />} />
    </Routes>
  );
}

export default App;
