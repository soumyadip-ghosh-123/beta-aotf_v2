import { SparklesCore } from "@/components/aceternity/sparkles";

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center overflow-hidden rounded-md">
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center relative z-20">
        Aceternity
      </h1>
      <div className="relative">
        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#000"
        />
      </div>
    </div>
  );
}
