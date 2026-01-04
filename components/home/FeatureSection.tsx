import { IoSchool } from "react-icons/io5";
import { FaIdCard, FaSearch} from "react-icons/fa";

const FeatureSection = () => {
  return (
    <section className="p-4 pt-2 max-w-md w-full mx-auto">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          What do you need?
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#151e2b] p-3 py-5 text-center shadow-sm border border-slate-100 dark:border-slate-800 transition-transform active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <IoSchool className="text-[20px]"/>
          </div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
            Find
            <br />
            Courses
          </span>
        </button>
        <button className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#151e2b] p-3 py-5 text-center shadow-sm border border-slate-100 dark:border-slate-800 transition-transform active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FaIdCard className="text-[20px]" />
          </div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
            Hire
            <br />
            Talent
          </span>
        </button>
        <button className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#151e2b] p-3 py-5 text-center shadow-sm border border-slate-100 dark:border-slate-800 transition-transform active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FaSearch className="text-[20px]" />
          </div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
            Search
            <br />
            Jobs
          </span>
        </button>
      </div>
    </section>
  );
};

export default FeatureSection;
