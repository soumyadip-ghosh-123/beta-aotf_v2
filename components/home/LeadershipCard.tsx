import React from "react";

interface LeadershipCardProps {
  name: string;
  role: string;
  image: string;
  quote: string;
}

const LeadershipCard = ({ name, role, image, quote }: LeadershipCardProps) => {
  return (
    <div className="group relative w-full max-w-md mx-auto flex items-center gap-5 p-5
      bg-white/80 dark:bg-slate-800/70 
      backdrop-blur-xl border border-white/20 dark:border-slate-700/50 
      rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">

      {/* Glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 
        bg-linear-to-br from-pink-500/20 to-purple-500/20 
        rounded-full blur-3xl group-hover:scale-110 transition-all duration-500" />

      {/* Avatar */}
      <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
        <div className="absolute inset-0 rounded-full bg-linear-to-tr from-pink-500 to-purple-500 opacity-20 blur-sm"></div>

        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover relative z-10"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center">
        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
          {name}
        </h4>

        <p className="text-sm font-medium mt-1 
          bg-linear-to-r from-pink-500 to-purple-500 
          bg-clip-text text-transparent">
          {role}
        </p>

        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 italic leading-relaxed">
          “{quote}”
        </p>
      </div>
    </div>
  );
};

export default LeadershipCard;