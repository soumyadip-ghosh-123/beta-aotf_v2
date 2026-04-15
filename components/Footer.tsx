"use client";
import Link from "next/link";
import { siteConfig, getFullAddress, getCopyrightText } from "@/config/site";
import { Button } from "@heroui/button";
import { FaFacebookSquare } from "react-icons/fa";
import { GrInstagram } from "react-icons/gr";
import { FaLinkedin } from "react-icons/fa6";
import ButtonGroup from "./ButtonGroup";
import WhatsAppButton from "./ui/icons/WhatsApp";

const Footer = () => {
  return (
    <footer className="m-auto px-4 mb-20 sm:mb-0 container w-full my-10">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10">
        {/* <div className="md:max-w-96">
          <h3 className="text-xl font-bold text-primary">{siteConfig.name}</h3>
          <p className="mt-2 text-md">{siteConfig.description}</p>
          <p>&nbsp;&nbsp;&nbsp; Currently we provide services in Kolkata, West Bengal based & we are expanding accross India.</p>

          <div className="flex items-center gap-4 mt-4">
            {Object.entries(siteConfig.social).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="capitalize">{platform}</span>
              </a>
            ))}
          </div>
        </div> */}

        <ButtonGroup className="px-0" />

        <div className="flex-1 flex md:flex-row items-start md:justify-end gap-5 md:gap-20">
          {/* <div>
            <h2 className="font-semibold mb-5 ">Quick Links</h2>
            <ul className="text-sm space-y-2">
              {siteConfig.footer.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          <div>
            <h2 className="font-semibold mb-1">Visit us at:</h2>
            <div className="text-sm space-y-2">
              <p>{getFullAddress()}</p>

              <h1 className="text-sm font-bold mt-3">Contact:</h1>
              <Link href={`tel:${siteConfig.contact.phone}`}>
                <p>{siteConfig.contact.phone}</p>
              </Link>
              <Link href={`mailto:${siteConfig.contact.email}`}>
                <p>{siteConfig.contact.email}</p>
              </Link>
            </div>

            <div className="mt-6">
              <div>
                <h1 className="text-sm font-bold">Let's get social:</h1>
              </div>
              <div className="flex gap-4 items-center mt-3">
                <Button
                  isIconOnly
                  aria-label="Like"
                  color="primary"
                  variant="shadow"
                  onClick={() =>
                    window.open(siteConfig.social.facebook, "_blank")
                  }
                >
                  <FaFacebookSquare size={25} />
                </Button>
                <Button
                  isIconOnly
                  aria-label="Instagram"
                  variant="shadow"
                  className="bg-linear-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
                  onClick={() =>
                    window.open(siteConfig.social.instagram, "_blank")
                  }
                >
                  <GrInstagram size={25} className="text-white" />
                </Button>
                <Button
                  isIconOnly
                  aria-label="Take a photo"
                  variant="shadow"
                  onClick={() =>
                    window.open(siteConfig.social.linkedin, "_blank")
                  }
                >
                  <FaLinkedin size={25} className="text-primary" />
                </Button>
                <WhatsAppButton />
              </div>
            </div>
          </div>
          {/* <div>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1197.7760703767933!2d88.37678470299856!3d22.670175688411298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89c4f4b1f6df9%3A0x883dc4e23ab55936!2sAcademy%20Of%20Tutorials!5e1!3m2!1sen!2sin!4v1764139218173!5m2!1sen!2sin" width="400" height="250"   loading="lazy"></iframe>
          </div> */}
        </div>
      </div>

      <div className="pt-4 text-center text-sm pb-5 flex flex-col md:flex-row gap-1 justify-between items-center">
        <p>{getCopyrightText()}</p>
        <p>All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
