import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    desc: "",
    priority: "Low",
  });

  // For filtering (All / Completed / Pending)
  const [filter, setFilter] = useState("All");

  // AI Summary states
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch tasks from DB
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      alert("Please login first!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.desc)
      return alert("Please fill all fields");

    try {
      const res = await API.post("/tasks", newTask);
      setTasks((prev) => [...prev, res.data.task]);
      setShowModal(false);
      setNewTask({ title: "", desc: "", priority: "Low" });
    } catch (err) {
      console.error("Add Task Error:", err);
      alert("Failed to add task");
    }
  };

  // Mark task complete
  const handleComplete = async (id) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status: "Completed" });
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? res.data.task : task))
      );
    } catch (err) {
      console.error("Complete Task Error:", err);
      alert("Failed to mark as completed");
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Delete Task Error:", err);
      alert("Failed to delete task");
    }
  };

  // Analyze all tasks with AI
  const handleAnalyzeAll = async () => {
    if (tasks.length === 0) return alert("No tasks to analyze!");
    setAiLoading(true);
    try {
      const res = await API.post("/ai/analyze-all", { tasks });
      setAiSummary(res.data.result);
    } catch (err) {
      console.error(err);
      alert("AI summary failed!");
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Tasks
  const filteredTasks =
    filter === "Completed"
      ? tasks.filter((t) => t.status === "Completed")
      : filter === "Pending"
      ? tasks.filter((t) => t.status === "Pending")
      : tasks;

  return (
    <>
      <Navbar />

      <div className="flex bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen pt-20">
        {/* ✅ Sidebar */}
        <div className="w-64 bg-white shadow-md border-r border-gray-200 fixed left-0 top-20 bottom-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-10 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
              Dashboard
            </h1>
            <button
              onClick={handleAnalyzeAll}
              disabled={aiLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:scale-105"
            >
              {aiLoading ? "Analyzing..." : "🤖 Analyze All Tasks"}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-6">
            {["All", "Pending", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab
                    ? "bg-purple-600 text-white shadow"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* AI Summary Box */}
          {aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-300 p-6 rounded-2xl mb-8 shadow-sm max-w-5xl"
            >
              <h2 className="text-lg font-semibold text-purple-700 mb-2 flex items-center gap-2">
                🧠 AI Summary
              </h2>
              <p className="text-gray-800 whitespace-pre-line leading-relaxed text-[15px]">
                {aiSummary}
              </p>
            </motion.div>
          )}

          {/* Task Cards */}
          {loading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  {...task}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-lg">No tasks yet. Add one! </p>
          )}

          {/* Add Task Floating Button */}
          <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all transform hover:scale-110"
          >
            + Add Task
          </button>

          {/* Add Task Modal */}
          <AnimatePresence>
            {showModal && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex justify-center items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white p-8 rounded-2xl shadow-lg w-96"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-purple-600">
                    Add New Task 📝
                  </h2>
                  <form onSubmit={handleAddTask}>
                    <input
                      type="text"
                      placeholder="Task Title"
                      className="w-full mb-3 p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                    />
                    <textarea
                      placeholder="Task Description"
                      className="w-full mb-3 p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
                      value={newTask.desc}
                      onChange={(e) =>
                        setNewTask({ ...newTask, desc: e.target.value })
                      }
                    ></textarea>
                    <select
                      className="w-full mb-4 p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({ ...newTask, priority: e.target.value })
                      }
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>

                    <div className="flex justify-end gap-4">
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
                        Add Task
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
