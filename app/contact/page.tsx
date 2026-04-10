import BackButton from "@/components/BackButton";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

export default function DocsPage() {
  return (
    <div>
      <BackButton title="Contact Us" />
      <div className="container mx-auto px-4 py-8 pb-20 ">
        <section className="mt-5 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="container px-4 py-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Get in touch</h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Have a question or want to work together? Fill out the form
                    and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name">Name</label>
                      <Input id="name" placeholder="Enter your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email">Email</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message">Message</label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message"
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button type="submit">Submit</Button>
                </form>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Contact Information</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Get in touch with us using the information below.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Office Address</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        11 No. Dulal Nagar, Belgharia, Kolkata – 700056 <br />
                        Near Alap Banquet
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <PhoneIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        6290338214 (WhatsApp & Call)
                      </p>
                    </div>
                  </div>
                  <a href="mailto:contact@aotf.in" className="block">
                    <div className="flex items-start gap-2 cursor-pointer">
                      <MailIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          contact@aotf.in
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
