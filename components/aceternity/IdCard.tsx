"use client";

import React, { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";

export function IdCard() {
  const [alpha, setAlpha] = useState(0); // Z axis
  const [beta, setBeta] = useState(0); // X axis
  const [gamma, setGamma] = useState(0); // Y axis
  const [useGyro, setUseGyro] = useState(true);

  useEffect(() => {
    if (!useGyro) return;

    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        // @ts-ignore
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          // @ts-ignore
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission !== "granted") return;
        } catch (e) {
          console.error("Gyro permission denied", e);
        }
      }

      window.addEventListener("deviceorientation", handleOrientation);
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setAlpha(event.alpha ?? 0);
      setBeta(event.beta ?? 0);
      setGamma(event.gamma ?? 0);
    };

    requestPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [useGyro]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-8 items-center justify-center p-6">
      {/* Control Panel */}
      <div className="w-full max-w-sm rounded-xl border p-4 space-y-4 bg-muted">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Orientation Controls</h3>
          <button
            onClick={() => setUseGyro((v) => !v)}
            className="px-3 py-1 text-xs rounded-md border"
          >
            {useGyro ? "Using Gyro" : "Manual Mode"}
          </button>
        </div>

        {/* Alpha */}
        <div>
          <label className="text-sm">α (alpha)</label>
          <input
            type="range"
            min={0}
            max={360}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            {alpha.toFixed(2)}
          </div>
        </div>

        {/* Beta */}
        <div>
          <label className="text-sm">β (beta)</label>
          <input
            type="range"
            min={-90}
            max={90}
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">{beta.toFixed(2)}</div>
        </div>

        {/* Gamma */}
        <div>
          <label className="text-sm">γ (gamma)</label>
          <input
            type="range"
            min={-90}
            max={90}
            value={gamma}
            onChange={(e) => setGamma(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            {gamma.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 3D Card */}
      <CardContainer
        className="inter-var"
        useGyro={true}
        alpha={alpha}
        beta={beta}
        gamma={gamma}
      >
        <CardBody className="bg-gray-50 relative group/card dark:bg-black border w-[20rem] sm:w-[30rem] rounded-xl p-6">
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-neutral-600 dark:text-white"
          >
            Orientation Controlled Card
          </CardItem>

          <CardItem
            as="p"
            translateZ="60"
            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
          >
            Change α, β, γ sliders or move your phone
          </CardItem>

          <CardItem translateZ="100" className="w-full mt-4">
            <img
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
              className="h-60 w-full object-cover rounded-xl"
              alt="thumbnail"
            />
          </CardItem>
        </CardBody>
      </CardContainer>
    </div>
  );
}
