import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  color: "purple" | "teal" | "blue" | "yellow" | "red";
  icon?: string;
}

export default function StatCard({ title, value, color, icon }: StatCardProps) {
  const colors: Record<string, string> = {
    purple: "from-purple-100 to-purple-200 text-purple-800 border-purple-300",
    teal: "from-teal-100 to-teal-200 text-teal-800 border-teal-300",
    blue: "from-blue-100 to-blue-200 text-blue-800 border-blue-300",
    yellow: "from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
    red: "from-red-100 to-red-200 text-red-800 border-red-300",
  };

  const barColors: Record<string, string> = {
    purple: "bg-purple-400",
    teal: "bg-teal-400",
    blue: "bg-blue-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400",
  };

  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setBarWidth(Math.floor(Math.random() * 80) + 20); // simulate activity % bar
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`rounded-xl shadow-md p-5 border bg-gradient-to-br ${colors[color]} transition transform hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-4xl font-bold mb-4">{value}</p>
      <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColors[color]} rounded-full transition-all duration-700`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </motion.div>
  );
}
