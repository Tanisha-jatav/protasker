import { useState } from "react";
import API from "../api/axios";  
import { motion, AnimatePresence } from "framer-motion";

function TaskCard({ _id, title, desc, priority, status, onComplete, onDelete }) {
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [glow, setGlow] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setShowInsight(true);
    setGlow(false);

    try {
      const response = await API.post("/ai/analyze", {
        title,
        desc,
      });

      setAiInsight(response.data.result);
      setGlow(true);

      setTimeout(() => setGlow(false), 1500);
    } catch (error) {
      console.error("AI Error:", error.response?.data || error);
      setAiInsight("⚠️ AI couldn't analyze this task right now.");
    } finally {
      setLoading(false);
    }
  };

  const priorityGlow =
    priority === "High"
      ? "from-red-500 to-pink-500"
      : priority === "Medium"
      ? "from-yellow-400 to-orange-500"
      : "from-green-400 to-teal-500";

  return (
    <motion.div
      layout
      className={`relative bg-white transition-all p-6 rounded-2xl border shadow-lg hover:shadow-2xl flex flex-col justify-between
        ${
          glow
            ? `border-4 border-transparent bg-gradient-to-r ${priorityGlow} bg-clip-border`
            : "border-gray-100"
        }`}
      style={{
        minHeight: "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* TASK DETAILS */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{desc}</p>

        <div className="flex justify-between items-center mb-4">
          {/* Status */}
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              status === "Completed"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
            }`}
          >
            {status}
          </span>

          {/* Priority */}
          <span
            className={`text-xs px-3 py-1 rounded-full ${
              priority === "High"
                ? "bg-red-100 text-red-700"
                : priority === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {priority} Priority
          </span>
        </div>
      </div>

      {/* BUTTON ROW */}
      <div className="flex justify-between items-center gap-2 mt-auto mb-2">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex-1 text-sm bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white px-3 py-2 rounded-lg shadow-md transition-all transform hover:scale-105 text-center"
        >
          {loading ? "Thinking..." : "🧠 Analyze"}
        </button>

        {status !== "Completed" && (
          <button
            onClick={() => onComplete(_id)}
            className="w-[40px] h-[38px] flex justify-center items-center bg-green-500 text-white text-lg rounded-lg hover:bg-green-600 transition-all"
            title="Mark as Done"
          >
            ✅
          </button>
        )}

        <button
          onClick={() => onDelete(_id)}
          className="w-[40px] h-[38px] flex justify-center items-center bg-red-500 text-white text-lg rounded-lg hover:bg-red-600 transition-all"
          title="Delete Task"
        >
          ✖
        </button>
      </div>

      {/* AI INSIGHT SECTION */}
      <AnimatePresence>
        {showInsight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-3 bg-gradient-to-tr from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-inner text-sm text-gray-800 p-4 overflow-y-auto"
            style={{
              maxHeight: "100px",
              minHeight: "80px",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-600 text-lg">💡</span>
              <h4 className="font-semibold text-purple-700 text-[15px]">
                Insight
              </h4>
            </div>

            <p className="text-gray-700 text-[14px] leading-relaxed">
              {loading ? "Thinking..." : aiInsight}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TaskCard;
