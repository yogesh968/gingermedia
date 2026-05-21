"use client";

import { UploadZone } from "@/components/upload-zone";
import { Activity, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden mesh-bg">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-16 md:py-32 flex flex-col items-center relative z-10">
        
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16 space-y-6 max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism text-foreground text-sm font-semibold mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-gradient">Enterprise Media Processing</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter lg:leading-[1.1] text-foreground">
            Intelligent Media <br className="hidden md:block" /> <span className="text-gradient-primary">Pipeline</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Automated quality checks, blur detection, AI-powered OCR, and advanced tampering heuristics in milliseconds.
          </motion.p>
        </motion.div>

        {/* Upload Component */}
        <motion.div 
          className="w-full mb-24 z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <UploadZone />
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 w-full max-w-5xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {[
            {
              icon: <Activity className="w-6 h-6 text-blue-400" />,
              title: "Quality Metrics",
              desc: "Instant Laplacian blur detection and brightness analysis to ensure optimal image clarity."
            },
            {
              icon: <Zap className="w-6 h-6 text-purple-400" />,
              title: "Plate Extraction",
              desc: "Advanced Tesseract-based text recognition tuned for Indian vehicle registration plates."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-pink-400" />,
              title: "Tamper Detection",
              desc: "Heuristics to identify screenshots, exact duplicates, and metadata tampering."
            }
          ].map((feature, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -5 }} className="group p-8 rounded-2xl glassmorphism flex flex-col space-y-4 hover:border-foreground/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="w-12 h-12 bg-background/50 rounded-xl flex items-center justify-center mb-2 border border-white/5 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-xl tracking-tight text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.desc}</p>
              <div className="pt-4 flex items-center text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                Learn more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
