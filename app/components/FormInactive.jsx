"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function FormInactive({ formTitle }) {
  const router = useRouter();

  return (
    <div className="h-[100dvh] w-full flex flex-col justify-center items-center bg-white font-karla font-normal overflow-hidden">
      <div className="w-full max-w-md flex flex-col justify-center px-4">
        <div className="w-full text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-6"
          >
            <h2
              className="text-[30px] font-[500] leading-[36px] text-[#37404A] mb-[20px]"
              style={{ margin: "0px 0px 20px" }}
            >
              Form Temporarily Unavailable
            </h2>

            <p className="text-[18px] leading-[28px] text-[#37404AB3]">
              We're sorry, but {formTitle || "this form"} is currently not
              accepting submissions.
            </p>

            <p className="text-[18px] leading-[28px] text-[#37404AB3]">
              Please check back later or contact us for more information.
            </p>

            <div className="pt-4">
              <Button
                onClick={() => router.push("/")}
                className="bg-[#37404A] hover:bg-[#37404acc] text-white text-[18px] leading-[28px] py-[6px] px-[20px] rounded-[6px] font-karla font-medium cursor-pointer"
              >
                Return to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
