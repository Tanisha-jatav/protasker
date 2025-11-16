import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";
import { Link } from "react-router-dom";

function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.projects || [];
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      alert("Please login first!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Create new project
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await API.post("/projects", newProject);
      const created = res.data.project || res.data;
      setProjects((prev) => [created, ...prev]);
      setShowModal(false);
      setNewProject({ name: "", description: "" });
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project");
    }
  };

  // Copy invite link
  const handleCopyLink = (projectId) => {
    const inviteURL = `${window.location.origin}/join/${projectId}`;
    navigator.clipboard.writeText(inviteURL);
    alert("📋 Invite link copied!\nShare with your teammates:\n" + inviteURL);
  };

  // Update project status (Instant toggle)
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/projects/${id}/status`, { status });
      const updated = res.data.project;

      setProjects((prev) =>
        prev.map((proj) =>
          proj._id === id ? { ...proj, status: updated.status } : proj
        )
      );
    } catch (err) {
      console.error("Failed to update project status:", err);
      alert("Failed to update project status");
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await API.delete(`/projects/${id}`);
        setProjects((prev) => prev.filter((proj) => proj._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete project");
      }
    }
  };

  // Filter logic
  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.status === filter);

  return (
    <>
      <Navbar />
      <div className="flex bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen pt-20">
        {/* Sidebar */}
        <div className="w-64 fixed left-0 top-20 bottom-0 bg-white border-r shadow-sm">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 flex flex-col items-center justify-start p-10">
          {/* Header */}
          <div className="w-full max-w-6xl flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800">
              Projects 💼
            </h1>

            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full shadow-md hover:opacity-90 transition-all"
            >
              + New Project
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-4 mb-8">
            {["All", "Pending", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === tab
                    ? "bg-purple-600 text-white shadow"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-purple-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          {loading ? (
            <p className="text-gray-500 text-lg mt-10">Loading projects...</p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-gray-500 text-lg mt-10 text-center">
              No {filter !== "All" ? filter.toLowerCase() : ""} projects yet.
            </p>
          ) : (
            <div className="flex justify-center w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl justify-items-center">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj._id}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 text-center w-80"
                  >
                    <h3 className="text-xl font-semibold text-purple-700 mb-2">
                      {proj?.name || "Untitled Project"}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {proj?.description || "No description provided."}
                    </p>
                    <p
                      className={`text-sm font-semibold mb-3 ${
                        proj.status === "Completed"
                          ? "text-green-600"
                          : "text-orange-500"
                      }`}
                    >
                      Status: {proj.status}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/projects/${proj._id}/chat`}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition-all"
                      >
                        💬 Open Chat
                      </Link>
                      <button
                        onClick={() => handleCopyLink(proj._id)}
                        className="text-sm text-purple-600 hover:text-pink-500 transition-all"
                      >
                        🔗 Copy Invite Link
                      </button>

                      <div className="flex justify-center gap-3 mt-2">
                        {proj.status === "Pending" ? (
                          <button
                            onClick={() =>
                              handleUpdateStatus(proj._id, "Completed")
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUpdateStatus(proj._id, "Pending")
                            }
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            Mark Pending
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProject(proj._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Project Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-purple-600">
                  Add New Project 💼
                </h2>
                <form onSubmit={handleAddProject}>
                  <input
                    type="text"
                    placeholder="Project Name"
                    className="w-full mb-3 p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Project Description"
                    className="w-full mb-3 p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                  ></textarea>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Add Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProjectDashboard;
