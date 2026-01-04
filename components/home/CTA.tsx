import React from "react";
import { IoSchool } from "react-icons/io5";
const CTA = () => {
  return (
    <section className="px-4 pb-20">
      <div className="rounded-xl bg-gradient-to-r from-primary to-blue-500 p-5 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold">Become an Instructor</h3>
            <p className="mt-1 text-xs text-white/90">
              Share your knowledge and earn money by teaching students
              worldwide.
            </p>
            <button className="mt-3 rounded-md bg-white px-4 py-2 text-xs font-bold text-primary hover:bg-slate-50">
              Join Now
            </button>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
            <IoSchool className="text-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
