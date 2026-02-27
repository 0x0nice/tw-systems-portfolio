"use client";

import { motion } from "framer-motion";

interface SystemCardProps {
  id: string;
  title: string;
  thesis: string;
  tech: string[];
}

export default function SystemCard({
  id,
  title,
  thesis,
  tech,
}: SystemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
      className="group relative border border-cadLine bg-glass backdrop-blur-md p-8 flex flex-col justify-between min-h-[300px] hover:border-techGray transition-colors duration-200"
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <span className="text-techGray text-xs uppercase tracking-widest">
            {id}
          </span>
          <div className="h-2 w-2 rounded-full bg-techGray group-hover:bg-cobalt transition-colors duration-200" />
        </div>
        <h3 className="font-serif text-3xl mb-3 text-softWhite">{title}</h3>
        <p className="text-techGray text-sm leading-relaxed mb-6">{thesis}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tech.map((item, index) => (
          <span
            key={index}
            className="text-xs text-techGray border border-cadLine px-2 py-1 uppercase tracking-wider"
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
