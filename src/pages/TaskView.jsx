import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";
import { motion } from "framer-motion";
import API from "../api/axios";

function TaskView({ filterType }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      const allTasks = res.data.tasks || [];

      // Filter based on type
      const filtered =
        filterType === "Pending"
          ? allTasks.filter((t) => t.status === "Pending")
          : filterType === "Completed"
          ? allTasks.filter((t) => t.status === "Completed")
          : allTasks;

      setTasks(filtered);
    } catch (err) {
      console.error(err);
      alert("Please login first!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterType]);

  // Delete Task
  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  // Complete Task
  const handleComplete = async (id) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status: "Completed" });
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? res.data.task : task))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to mark as completed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen pt-20">
        <div className="w-64 bg-white shadow-md border-r border-gray-200 fixed left-0 top-20 bottom-0">
          <Sidebar />
        </div>

        <div className="flex-1 ml-64 p-10 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
              {filterType === "Completed"
                ? "✅ Completed Tasks"
                : filterType === "Pending"
                ? "⏳ Pending Tasks"
                : "📋 All Tasks"}
            </h1>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  {...task}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-lg"
            >
              {filterType === "Completed"
                ? "No completed tasks yet. Finish some to see them here! 🎯"
                : filterType === "Pending"
                ? "All caught up! No pending tasks left 🥳"
                : "No tasks yet. Add one! 🌱"}
            </motion.p>
          )}
        </div>
      </div>
    </>
  );
}

export default TaskView;
