import { IoSchool } from "react-icons/io5";
import { FaIdCard, FaSearch } from "react-icons/fa";
import { Button } from "@heroui/button";

const FeatureSection = () => {
  return (
    <section className="pt-2 w-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Have an Enquiry or Question?
          <br />
          <span className="text-md font-normal text-slate-600 dark:text-slate-400">
            Get in Touch with Us.
          </span>
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-3 h-15">
        <Button
          variant="shadow"
          color="primary"
          className="h-full flex items-center justify-center gap-2"
        >
          <div className="flex items-center justify-center rounded-full">
            <IoSchool size={30} />
          </div>
          <span className="text-xl font-semibold text-center">Enquiry</span>
        </Button>

        {/* <Button variant="bordered" color="secondary" className="h-full flex items-center justify-center gap-2 bg-white dark:bg-black">
          <div className="flex items-center justify-center">
            <FaIdCard size={30} className="text-slate-600 dark:text-slate-400" />
          </div>

          <span className="font-semibold text-slate-600 leading-tight text-center">
            Hire
            <br />
            Talents
          </span>
        </Button> */}

        {/* search button */}
        {/* <Button className="group flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#151e2b] p-3 py-5 text-center shadow-sm border border-slate-100 dark:border-slate-800 transition-transform active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FaSearch className="text-[20px]" />
          </div>
          <span className="font-semibold text-slate-600 leading-tight">
            Search
            <br />
            Jobs
          </span>
        </Button> */}
      </div>
    </section>
  );
};

export default FeatureSection;
