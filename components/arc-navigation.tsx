"use client";

import React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Home,
  ClipboardList,
  User,
  ShoppingCart,
  Monitor,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const navItems: NavItem[] = [
  {
    id: "home",
    icon: <Home className="w-6 h-6" />,
    label: "Home",
    action: () => console.log("Home"),
  },
  {
    id: "clipboard",
    icon: <ClipboardList className="w-6 h-6" />,
    label: "Clipboard",
    action: () => console.log("Clipboard"),
  },
  {
    id: "user",
    icon: <User className="w-6 h-6" />,
    label: "Profile",
    action: () => console.log("Profile"),
  },
  {
    id: "cart",
    icon: <ShoppingCart className="w-6 h-6" />,
    label: "Cart",
    action: () => console.log("Cart"),
  },
  {
    id: "monitor",
    icon: <Monitor className="w-6 h-6" />,
    label: "Display",
    action: () => console.log("Display"),
  },
];

export function ArcNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [triggeredItem, setTriggeredItem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Arc configuration - flipped for left side
  const arcRadius = 140;
  const startAngle = -90; // degrees from bottom
  const endAngle = -200; // goes to the left side
  const angleStep = (endAngle - startAngle) / (navItems.length - 1);

  const getItemPosition = (index: number) => {
    const angle = startAngle + index * angleStep;
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * arcRadius;
    const y = Math.sin(radians) * arcRadius;
    return { x, y, angle };
  };

  const findClosestItem = useCallback((clientX: number, clientY: number) => {
    if (!triggerRef.current) return null;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    let closestIndex: number | null = null;
    let closestDistance = Infinity;

    navItems.forEach((_, index) => {
      const { x, y } = getItemPosition(index);
      const itemX = triggerCenterX + x;
      const itemY = triggerCenterY + y;

      const distance = Math.sqrt(
        Math.pow(clientX - itemX, 2) + Math.pow(clientY - itemY, 2)
      );

      if (distance < 50 && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    setIsOpen(true);
    setIsDragging(true);
    const closest = findClosestItem(clientX, clientY);
    setHoveredIndex(closest);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const closest = findClosestItem(clientX, clientY);
    setHoveredIndex(closest);
  };

  const handleEnd = () => {
    if (hoveredIndex !== null) {
      const item = navItems[hoveredIndex];
      setTriggeredItem(item.id);
      item.action();

      // Reset triggered state after animation
      setTimeout(() => setTriggeredItem(null), 300);
    }
    setIsDragging(false);
    setIsOpen(false);
    setHoveredIndex(null);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse handlers (for testing on desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalTouchEnd);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDragging, hoveredIndex]);

  // Generate arc path for the background
  const generateArcPath = () => {
    const innerRadius = arcRadius - 35;
    const outerRadius = arcRadius + 35;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = Math.cos(startRad) * innerRadius;
    const y1 = Math.sin(startRad) * innerRadius;
    const x2 = Math.cos(startRad) * outerRadius;
    const y2 = Math.sin(startRad) * outerRadius;
    const x3 = Math.cos(endRad) * outerRadius;
    const y3 = Math.sin(endRad) * outerRadius;
    const x4 = Math.cos(endRad) * innerRadius;
    const y4 = Math.sin(endRad) * innerRadius;

    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
      Z
    `;
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-50 z-50"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Arc background and items */}
      <div
        className={cn(
          "absolute bottom-0 left-0 transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none"
        )}
        style={{
          width: arcRadius * 2 + 100,
          height: arcRadius * 2 + 100,
        }}
      >
        {/* SVG Arc Background */}
        <svg
          className="absolute"
          style={{
            width: arcRadius * 2 + 100,
            height: arcRadius * 2 + 100,
            transform: "translate(-50px, 50px)",
          }}
          viewBox={`${-arcRadius - 50} ${-arcRadius - 50} ${arcRadius * 2 + 100} ${arcRadius * 2 + 100}`}
        >
          <path
            d={generateArcPath()}
            fill="#000000"
            className="drop-shadow-lg"
            style={{
              transform: "rotate(0deg)",
              transformOrigin: "center",
            }}
          />
        </svg>

        {/* Navigation Items */}
        {navItems.map((item, index) => {
          const { x, y } = getItemPosition(index);
          const isHovered = hoveredIndex === index;
          const isTriggered = triggeredItem === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                "absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
                "bg-indigo-400 text-indigo-900 shadow-lg",
                isHovered && "scale-125 -translate-y-2 bg-indigo-300 shadow-xl",
                isTriggered && "scale-90 bg-indigo-500"
              )}
              style={{
                bottom: -y + 28,
                left: x + 28,
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {item.icon}

              {/* Label tooltip */}
              {isHovered && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
          "shadow-lg select-none touch-none",
          isOpen
            ? "bg-indigo-500 text-white rotate-0"
            : "bg-indigo-400 text-indigo-900 hover:bg-indigo-300"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={cn(
            "transition-transform duration-300",
            isOpen ? "rotate-0" : "rotate-45"
          )}
        >
          <X className="w-6 h-6" />
        </div>
      </button>

      {/* Instruction hint */}
      {!isOpen && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap opacity-70">
          Hold & drag
        </div>
      )}
    </div>
  );
}
