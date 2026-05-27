// components/Hero.jsx

"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#071a16] text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-emerald-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-teal-400/15 blur-3xl rounded-full" />
        <div className="absolute top-[40%] left-[50%] w-[250px] h-[250px] bg-emerald-300/10 blur-3xl rounded-full" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-24 lg:pt-36 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

              <span className="text-sm text-gray-200">
                CA-Qualified Accounting & Advisory • Delhi NCR
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="
                text-4xl
                sm:text-5xl
                lg:text-6xl
                font-bold
                leading-tight
                tracking-tight
              "
            >
              Financial Clarity.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Business Confidence.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="
                mt-6
                text-lg
                text-gray-300
                leading-relaxed
                max-w-2xl
              "
            >
              Eleware Accounting simplifies your finances with expert
              bookkeeping, GST filing, tax advisory, and compliance
              services — designed for ambitious businesses across
              Delhi NCR and beyond.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button
                className="
                  bg-gradient-to-r
                  from-emerald-600
                  to-teal-600
                  hover:from-emerald-700
                  hover:to-teal-700
                  text-white
                  px-7
                  py-3.5
                  rounded-xl
                  font-medium
                  transition-all
                  duration-300
                  hover:scale-[1.02]
                  shadow-lg
                  shadow-emerald-500/25
                "
              >
                Book a Free Consultation
              </button>

              <button
                className="
                  border
                  border-white/15
                  bg-white/5
                  hover:bg-white/10
                  backdrop-blur-sm
                  text-white
                  px-7
                  py-3.5
                  rounded-xl
                  font-medium
                  transition-all
                  duration-300
                "
              >
                Explore Services
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="
                mt-12
                grid
                grid-cols-2
                sm:grid-cols-4
                gap-5
              "
            >
              {[
                {
                  value: "75+",
                  label: "Businesses Served",
                },
                {
                  value: "5+",
                  label: "Years Experience",
                },
                {
                  value: "98%",
                  label: "Client Retention",
                },
                {
                  value: "8+",
                  label: "Service Verticals",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="
                    bg-white/5
                    border
                    border-white/10
                    rounded-2xl
                    p-4
                    backdrop-blur-sm
                  "
                >
                  <div className="text-2xl font-bold text-white">
                    {item.value}
                  </div>

                  <div className="text-sm text-gray-400 mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div
              className="
                relative
                rounded-3xl
                border
                border-white/10
                bg-white/5
                backdrop-blur-xl
                overflow-hidden
                shadow-2xl
              "
            >
              {/* Top */}
              <div
                className="
                  px-6
                  py-4
                  border-b
                  border-white/10
                  flex
                  items-center
                  justify-between
                "
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>

                <div className="text-sm text-gray-300">
                  Eleware Dashboard
                </div>
              </div>

              {/* Dashboard */}
              <div className="p-6 space-y-5">
                {/* Card */}
                <div
                  className="
                    bg-[#0d2420]
                    border
                    border-white/10
                    rounded-2xl
                    p-5
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        Clients Managed
                      </p>

                      <h3 className="text-3xl font-bold mt-2">
                        75+
                      </h3>
                    </div>

                    <div
                      className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-emerald-500/20
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <svg
                        className="w-7 h-7 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="space-y-3">
                  {[
                    "✅ GST returns filed for Q4 — all clients",
                    "📊 MIS reports delivered to 12 clients",
                    "🏢 3 new Pvt Ltd companies incorporated",
                    "💰 Tax savings of ₹18L identified this month",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="
                        flex
                        items-center
                        gap-3
                        bg-white/5
                        border
                        border-white/10
                        rounded-xl
                        px-4
                        py-3
                      "
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400" />

                      <p className="text-sm text-gray-200">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom */}
                <div
                  className="
                    bg-gradient-to-r
                    from-emerald-600
                    via-teal-600
                    to-cyan-500
                    rounded-2xl
                    p-5
                  "
                >
                  <p className="text-sm text-emerald-100">
                    Clarity in Numbers
                  </p>

                  <h3 className="text-3xl font-bold mt-2">
                    Grow with Confidence
                  </h3>

                  <p className="mt-2 text-emerald-100 text-sm">
                    Accurate books, timely compliance, and strategic
                    advisory — all under one roof.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Card */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="
                hidden
                lg:block

                absolute
                -left-10
                bottom-10

                bg-white
                text-gray-800

                rounded-2xl
                shadow-2xl

                p-4
                w-60
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-green-100
                    flex
                    items-center
                    justify-center
                  "
                >
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h4 className="font-semibold">
                    GST Filed ✅
                  </h4>

                  <p className="text-sm text-gray-500">
                    All Q4 returns submitted
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}