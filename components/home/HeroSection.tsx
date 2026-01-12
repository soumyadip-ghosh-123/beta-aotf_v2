import { Button } from "@heroui/button";
import React from "react";

const HeroSection = () => {
  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-lg">
        <div className="absolute inset-0 z-0">
          <div
            className="h-full w-full bg-cover bg-center opacity-60"
            data-alt="Students studying together in a modern library setting"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAhR3UaYA40G_N-S9223pOZODWEAzNXVKNxz9TMC-p4AsPQZBQWJogU7zdStOe1CQ8hBA7UlNKCpJ9GusVuzJ8KOf8zZfLuXyJDKwL5gmrpLaCNsVbaeWmsi6ix1uGGbnrkh55uA2O9uLj13cox3gKYsX8quGzhg4P2bwXu28hDlzjquC9MnrwNFUEtearqP86cs2vPpt80wuRdwDtjfa29h8O6so32t1sX26PoYUz2wqp79ESF1Einy4E5FKn3lApb5qYsg6WOXWc")',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        </div>
        <div className="relative z-10 flex flex-col items-start gap-4 p-6 pt-24">
          <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-blue-200 ring-1 ring-inset ring-blue-400/20 backdrop-blur-sm">
            #1 Learning Platform
          </span>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Learn Skills, <br />
            <span className="text-blue-400">Earn Smart,</span> <br />
            Build Your Career
          </h2>
          <p className="max-w-xs text-sm text-slate-200/90">
            The all-in-one platform for your professional journey. Start
            learning or finding work today.
          </p>
          <Button className="mt-2 flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition-colors">
            Join Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
