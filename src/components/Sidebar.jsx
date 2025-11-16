import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `block py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
      pathname === path
        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="w-60 bg-white h-screen shadow-md flex flex-col p-4">
      <h2 className="text-2xl font-bold text-purple-600 mb-6">Dashboard</h2>
      
      <Link to="/dashboard" className={linkClass("/dashboard")}>
        📋 All Tasks
      </Link>
      <Link to="/dashboard/completed" className={linkClass("/dashboard/completed")}>
        ✅ Completed
      </Link>
      <Link to="/dashboard/pending" className={linkClass("/dashboard/pending")}>
        ⏳ Pending
      </Link>
      <Link to="/projects" className={linkClass("/projects")}>
        💼 Projects
      </Link>

      <div className="mt-auto">
        <Link
          to="/dashboard/add"
          className="block text-center py-2.5 rounded-md font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition-all shadow-md"
        >
          + Add Task
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
