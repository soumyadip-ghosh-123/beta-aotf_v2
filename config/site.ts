export type SiteConfig = typeof siteConfig;

export const navConfig = {
  name: "AOTF",
  description: "",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};


export const siteConfig = {
  // Basic site information
  ceo: "Soumyadip Ghosh",
  name: "Academy of Tutorials & Freelancers",
  shortName: "AOTF",
  subDescription: "Your Complete Platform for Learning, Earning & Skill-Based Opportunities",
  description: `From qualified tutors to skilled candidates, AOTF helps learners, guardians, and clients find trusted professionals with ease.`,
  url: "https://aotf.in",

  //payment ids
  UPI: {
    name: "Soumyadip Ghosh",
    Id: "sghosh5326-3@okaxis",
    Currency: "INR"
  },

  // Contact information
  contact: {
    phone: "+91 62903 38214",
    email: "contact@aotf.in",
    address: {
      street: "Belgharia",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700056",
      country: "India"
    }
  },

  // Social media links
  social: {
    facebook: "https://facebook.com/academyoftutorialsandfreelancers",
    twitter: "https://twitter.com/academyoftutorialsandfreelancers",
    instagram: "https://instagram.com/academyoftutorialsandfreelancers",
    linkedin: "https://linkedin.com/company/academyoftutorialsandfreelancers",
    youtube: "https://youtube.com/@academyoftutorialsandfreelancers"
  },

  // Footer links
  footer: {
    quickLinks: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Terms and Conditions", href: "/terms" },
      { name: "Refund Policy", href: "/refund-policy" },
      { name: "Privacy Policy", href: "/privacy-policy" },
    ],
    services: [
      { name: "For Teachers", href: "/teacher" },
      { name: "For Guardians", href: "/guardian" },
      { name: "Subjects", href: "/subjects" },
      { name: "Pricing", href: "/pricing" }
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Support", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Community", href: "/community" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" }
    ]
  },

  // Business information
  business: {
    registrationNumber: "GSTIN: 27ABCDE1234F1Z5",
    panNumber: "PAN: ABCDE1234F",
    founded: "2024",
    ceo: "Dr. Education Expert",
    headquarters: "Mumbai, Maharashtra, India"
  },

  // Payment information
  payment: {
    registrationFee: 49, // Teacher registration fee
    freelancerRegistrationFee: 99, // Freelancer registration fee
    currency: "INR",
    paymentGateway: "Razorpay",
    supportedMethods: ["UPI", "Card", "Wallet"]
  },

  // Features and capabilities
  features: {
    maxSubjects: 10,
    maxExperience: 50,
    supportedGrades: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"],
    supportedSubjects: [
      "Arts", "Humanities", "Commerce", "Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Computer Science", "Economics", "Accounting", "Art", "Music",
    ],
    learningModes: ["Online", "Offline", "Hybrid"],
    teachingModes: ["Online", "Offline", "Hybrid"],
    maxPostsPerStudent: 3 // Default value, can be changed in settings
  },

  // SEO and meta information
  seo: {
    titleTemplate: "%s | Academy of Tutorials and Freelancers",
    defaultTitle: "Academy of Tutorials and Freelancers- Connect with Qualified Tutors and Freelancers",
    defaultDescription: "Find qualified tutors and connect with guardians for personalized learning experiences. Join Academy of Tutorials and Freelancers today.",
    keywords: [
      "tutors",
      "education",
      "online learning",
      "home tuition",
      "academic support",
      "teachers",
      "guardians",
      "tutorials",
      "academic",
      "freelancing",
      "tutorials and freelancers",
      "tutorials and freelancers website",
      "academy of tutorials and freelancers",
      "academy of tutorials and freelancers website"
    ],
    author: "Academy of Tutorials and Freelancers",
    ogImage: "/og-image.jpg",
    twitterHandle: "@academyoftutors"
  },

  // App settings
  app: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedImageFormats: ["jpg", "jpeg", "png", "webp"],
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    passwordMinLength: 8
  },
  maxApplicationPerPost: 3
};

// Helper function to get full address
export const getFullAddress = () => {
  const { address } = siteConfig.contact;
  return `${address.street}, ${address.city}, ${address.state} ${address.pincode}, ${address.country}`;
};

// Helper function to get formatted phone number
export const getFormattedPhone = () => {
  return siteConfig.contact.phone;
};

// Helper function to get copyright text
export const getCopyrightText = () => {
  const currentYear = new Date().getFullYear();
  return `© 2021-${currentYear} ${siteConfig.name}. All rights reserved.`;
};
