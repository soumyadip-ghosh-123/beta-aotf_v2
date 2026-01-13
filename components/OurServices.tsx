import { Button } from "@heroui/button";
import Underline from "./ui/Underline";

export default function OurServices() {
  return (
    <>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
      <section className="flex flex-col md:flex-row items-center justify-center gap-10 my-10">
        <div className="relative shadow-2xl shadow-indigo-600/40 rounded-2xl overflow-hidden shrink-0">
          <img
            className="max-w-md w-full object-cover rounded-2xl"
            src="https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?q=80&w=451&h=451&auto=format&fit=crop"
            alt=""
          />
          <div className="flex items-center gap-1 max-w-72 absolute bottom-3 left-8 bg-white p-1 rounded-xl">
            <div className="flex -space-x-4 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                alt="image"
                className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-1"
              />
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                alt="image"
                className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-[2]"
              />
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
                alt="image"
                className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition z-[3]"
              />
              <div className="flex items-center justify-center text-xs  text-white size-9 rounded-full border-[3px] border-white bg-indigo-600 hover:-translate-y-1 transition z-[4]">
                99+
              </div>
            </div>
            <p className="text-xs font-medium text-slate-800">
              Join the AOTF teacher & talent community.
            </p>
          </div>
        </div>
        <div className="text-sm max-w-lg px-5">
          <Underline title="Our Services" size="large" className="mb-4" />
          <p className="mt-8">
            AOTF bridges the gap between trusted educators, skilled professionals, and those who need them. We provide a structured, reliable platform to connect guardians with qualified teachers and clients with verified freelancers across India.{" "}
          </p>
          <p className="mt-4">
            From 1:1 personalized tutoring and batch tuition (online or at home) to freelance and job-based talent hiring, AOTF ensures quality matching, transparent processes, and dependable support at every step.
          </p>
          <p className="mt-4">
            Whether you are looking to learn, teach, hire, or work, AOTF makes the connection simple, secure, and scalable.
          </p>
          <Button className="flex items-center w-max gap-2 mt-8 hover:-translate-y-0.5 transition bg-gradient-to-r from-indigo-600 to-[#8A7DFF] py-3 px-8 rounded-full text-white">
            <span>Read more</span>
            <svg
              width="13"
              height="12"
              viewBox="0 0 13 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.53 6.53a.75.75 0 0 0 0-1.06L7.757.697a.75.75 0 1 0-1.06 1.06L10.939 6l-4.242 4.243a.75.75 0 0 0 1.06 1.06zM0 6v.75h12v-1.5H0z"
                fill="#fff"
              />
            </svg>
          </Button>
        </div>
      </section>
    </>
  );
}
