"use client";

import Lottie from "lottie-react";
import animationData from "@/public/animations/Thank_You.json";

export default function LottiePlayer({ size = 300 }) {
  return (
    <div style={{ width: size, height: size }}>
      <Lottie animationData={animationData} loop={true} autoplay={true} />
    </div>
  );
}
