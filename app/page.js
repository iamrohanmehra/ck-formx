"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col bg-white font-karla font-normal"
      style={{ fontFamily: "'Karla', sans-serif" }}
    >
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2
              className="text-[30px] font-[500] leading-[36px] text-[#37404A] mb-[20px]"
              style={{ margin: "0px 0px 20px" }}
            >
              Welcome to the Codekaro Formx Tool!
            </h2>

            <p className="text-[18px] leading-[28px] text-[#37404AB3]">
              If you the have the specific form url, fill and submit it. 😉
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
