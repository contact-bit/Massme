"use client";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

type Props = {
  id?: string;
  children: React.ReactNode;
};

export default function AnimatedSection({ id, children }: Props) {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  return (
    <section id={id} ref={ref} className="relative">
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 60 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
          },
        }}
        initial="hidden"
        animate={controls}
      >
        {children}
      </motion.div>
    </section>
  );
}
