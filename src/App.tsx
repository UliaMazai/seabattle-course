import { motion } from "motion/react";

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg"
      >
        Выстрел!
      </motion.button>
    </div>
  );
}

export default App;