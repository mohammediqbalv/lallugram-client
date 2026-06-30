import { motion } from "framer-motion";
import "../styles/home-background.css";

const floatingBlobs = [
  {
    className: "blob blob-one",
    duration: 18,
    x: ["-6%", "7%", "-5%"],
    y: ["-4%", "8%", "-2%"],
    scale: [1, 1.08, 0.96, 1],
  },
  {
    className: "blob blob-two",
    duration: 22,
    x: ["5%", "-8%", "6%"],
    y: ["-2%", "9%", "-5%"],
    scale: [1, 0.95, 1.07, 1],
  },
  {
    className: "blob blob-three",
    duration: 20,
    x: ["3%", "-7%", "4%"],
    y: ["6%", "-6%", "5%"],
    scale: [1, 1.05, 0.94, 1],
  },
];

export default function HomeBackground() {
  return (
    <div className="home-background" aria-hidden="true">
      <div className="noise-overlay" />

      {floatingBlobs.map((blob) => (
        <motion.div
          key={blob.className}
          className={blob.className}
          animate={{
            x: blob.x,
            y: blob.y,
            scale: blob.scale,
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="halo"
        animate={{
          opacity: [0.2, 0.45, 0.2],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
