"use client";

import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Edit,
  Trash2,
  Download,
  Eye,
  Search,
  Save,
  CheckCircle,
  List,
} from "lucide-react";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import FloatingLabelInput from "@/components/invoice/FloatingLabelInput";
import BillToSection from "@/components/invoice/BillToSection";
import ItemDetails from "@/components/invoice/ItemDetails";
import InvoiceTemplate from "@/components/invoice/templates/InvoiceTemplate";
import { generatePDF } from "@/lib/utils/pdfGenerator";
// import { templates } from "@/utils/templateRegistry";
import { siteConfig } from "@/config/site";
import { Card } from "@heroui/card";

interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  amount: number;
  total: number;
  postDetails?: {
    postId?: string;
    preferredTime?: string;
    preferredDays?: string[];
    location?: string;
  };
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
}

interface InvoiceInfo {
  date: string;
  paymentDate: string;
  number: string;
}

interface InvoiceFormData {
  billTo: CompanyInfo;
  shipTo: CompanyInfo;
  invoice: InvoiceInfo;
  yourCompany: CompanyInfo;
  items: InvoiceItem[];
  taxPercentage: number;
  taxAmount: number;
  subTotal: number;
  grandTotal: number;
  notes: string;
  selectedCurrency: string;
  signature: string;
  websiteUrl: string;
  paymentStatus: string;
}

const generateRandomInvoiceNumber = (): string => {
  // Generate 4-6 characters with 2-3 letters and rest numbers
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  // Random length between 4-6
  const length = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6

  // Random letter count between 2-3
  const letterCount = Math.floor(Math.random() * 2) + 2; // 2 or 3

  let result = "";

  // Add letters
  for (let i = 0; i < letterCount; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  // Add numbers
  for (let i = letterCount; i < length; i++) {
    result += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return result;
};

const noteOptions = [
  "Thank you for choosing us today! We hope your shopping experience was pleasant and seamless.",
  "Your purchase supports our community! We believe in giving back and working towards a better future.",
  "We value your feedback! Help us improve by sharing your thoughts.",
  "Did you know you can save more with our loyalty program? Ask about it on your next visit.",
  "Need assistance with your purchase? We're here to help! Reach out to our customer support.",
  "Keep this receipt for returns or exchanges.",
  "Every purchase makes a difference! We are dedicated to eco-friendly practices and sustainability.",
  "Have a great day!",
  "Thank you for shopping with us today.",
  "Eco-friendly business. This receipt is recyclable.",
];

export default function AdminInvoicePage() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");
  const [billTo, setBillTo] = useState<CompanyInfo>({
    name: "",
    address: "",
    phone: "",
  });
  const [shipTo, setShipTo] = useState<CompanyInfo>({
    name: "",
    address: "",
    phone: "",
  });
  const [invoice, setInvoice] = useState<InvoiceInfo>({
    date: "",
    paymentDate: "",
    number: "",
  });
  const [yourCompany, setYourCompany] = useState<CompanyInfo>({
    name: siteConfig.name || "Academy of Tutorials & Freelancers",
    address:
      siteConfig.contact.address.street ||
      "11 No. Dulal Nagar, Belgharia near Alap Banquet",
    phone: siteConfig.contact.phone || "+91 6290338214",
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [signature, setSignature] = useState<string>(
    "/api/v1/admin/private-image?name=sign.png"
  );
  const [websiteUrl, setWebsiteUrl] = useState<string>(
    siteConfig.url || "https://www.aotf.in"
  );
  const [paymentStatus, setPaymentStatus] = useState<string>("unpaid");
  const [postId, setPostId] = useState<string>("");
  const [isFetchingPost, setIsFetchingPost] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [currentTemplate] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string>("");
  const [isInvoiceSaved, setIsInvoiceSaved] = useState<boolean>(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSavedData, setLastSavedData] = useState<InvoiceFormData | null>(
    null
  );

  const refreshNotes = () => {
    const randomIndex = Math.floor(Math.random() * noteOptions.length);
    setNotes(noteOptions[randomIndex]);
  };

  useEffect(() => {
    // Load form data from localStorage on component mount
    const savedFormData = localStorage.getItem("adminInvoiceFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setBillTo(parsedData.billTo || { name: "", address: "", phone: "" });
        setShipTo(parsedData.shipTo || { name: "", address: "", phone: "" });
        setInvoice(
          parsedData.invoice || { date: "", paymentDate: "", number: "" }
        );
        setYourCompany(
          parsedData.yourCompany || {
            name: siteConfig.name || "Academy of Tutorials & Freelancers",
            address:
              siteConfig.contact.address.street ||
              "11 No. Dulal Nagar, Belgharia near Alap Banquet",
            phone: siteConfig.contact.phone || "+91 6290338214",
          }
        );
        setItems(parsedData.items || []);
        setTaxPercentage(parsedData.taxPercentage || 0);
        setNotes(parsedData.notes || "");
        setSelectedCurrency(parsedData.selectedCurrency || "INR");
        setSignature(
          parsedData.signature || "/api/v1/admin/private-image?name=sign.png"
        );
        setWebsiteUrl(
          parsedData.websiteUrl || siteConfig.url || "https://www.aotf.in"
        );
        setPaymentStatus(parsedData.paymentStatus || "unpaid");
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    } else {
      // If no saved data, set invoice number
      setInvoice((prev) => ({
        ...prev,
        number: generateRandomInvoiceNumber(),
      }));
    }
  }, []);

  useEffect(() => {
    // Save form data to localStorage whenever it changes
    const formData: InvoiceFormData = {
      billTo,
      shipTo,
      invoice,
      yourCompany,
      items,
      taxPercentage,
      taxAmount,
      subTotal,
      grandTotal,
      notes,
      selectedCurrency,
      signature,
      websiteUrl,
      paymentStatus,
    };
    localStorage.setItem("adminInvoiceFormData", JSON.stringify(formData));
    localStorage.setItem("adminSelectedTemplate", currentTemplate.toString());
  }, [
    billTo,
    shipTo,
    invoice,
    yourCompany,
    items,
    taxPercentage,
    notes,
    taxAmount,
    subTotal,
    grandTotal,
    selectedCurrency,
    currentTemplate,
    signature,
    websiteUrl,
    paymentStatus,
  ]);
  const handleInputChange =
    <T extends CompanyInfo | InvoiceInfo>(
      setter: React.Dispatch<React.SetStateAction<T>>
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setter((prev) => ({ ...prev, [name]: value }) as T);
    };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "amount") {
      newItems[index].total =
        Number(newItems[index].quantity) * Number(newItems[index].amount);
    }
    setItems(newItems);
    setHasUnsavedChanges(true); // Mark as having unsaved changes
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: "", description: "", quantity: 0, amount: 0, total: 0 },
    ]);
    setHasUnsavedChanges(true);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setHasUnsavedChanges(true);
  };

  const calculateSubTotal = () => {
    const calculatedSubTotal = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.amount),
      0
    );
    setSubTotal(calculatedSubTotal);
    return calculatedSubTotal;
  };

  const calculateTaxAmount = (subTotalValue: number) => {
    const tax = (subTotalValue * taxPercentage) / 100;
    setTaxAmount(tax);
    return tax;
  };
  const calculateGrandTotal = (
    subTotalValue: number,
    taxAmountValue: number
  ) => {
    const total =
      parseFloat(String(subTotalValue)) + parseFloat(String(taxAmountValue));
    setGrandTotal(total);
    return total;
  };

  // const handleTaxPercentageChange = (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const taxRate = parseFloat(e.target.value) || 0;
  //   setTaxPercentage(taxRate);
  //   setHasUnsavedChanges(true);
  // };

  useEffect(() => {
    const currentSubTotal = calculateSubTotal();
    const currentTaxAmount = calculateTaxAmount(currentSubTotal);
    calculateGrandTotal(currentSubTotal, currentTaxAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, taxPercentage]);

  // const handleTemplateClick = (templateNumber: number) => {
  //   setCurrentTemplate(templateNumber);
  //   setShowPreview(true);
  // };

  // Auto-save invoice to database
  const autoSaveInvoice = async (silent: boolean = false) => {
    // Validation
    if (!billTo.name || !billTo.address || !billTo.phone) {
      if (!silent)
        addToast({
          description: "Please fill in all Bill To fields",
          color: "danger",
        });
      return;
    }

    if (!invoice.date || !invoice.paymentDate) {
      if (!silent)
        addToast({
          description: "Please fill in invoice date and payment date",
          color: "danger",
        });
      return;
    }

    if (items.length === 0) {
      if (!silent)
        addToast({
          description: "Please add at least one item to the invoice",
          color: "danger",
        });
      return;
    }

    if (!silent) setIsSaving(true);

    try {
      // Determine if this is for a post or project
      const trimmedId = postId.trim().toUpperCase();
      const isProject = trimmedId.startsWith("PRJ-");
      const isPost = trimmedId.startsWith("P-");

      const invoiceData = {
        invoiceNumber: invoice.number.toUpperCase(),
        invoiceDate: invoice.date,
        paymentDate: invoice.paymentDate,
        paymentStatus,

        yourCompany,
        billTo,
        shipTo: shipTo.name ? shipTo : billTo, // Use billTo if shipTo is empty

        items,
        subTotal,
        taxPercentage,
        taxAmount,
        grandTotal,

        notes,
        currency: selectedCurrency,
        signature,
        websiteUrl,

        postId: isPost ? postId : undefined,
        projectId: isProject ? postId : undefined,
      };

      console.log("📤 Sending invoice data:", invoiceData);

      // Check if invoice already exists (for update)
      let response;
      if (isInvoiceSaved && savedInvoiceId) {
        // Update existing invoice
        console.log(`🔄 Updating existing invoice: ${invoice.number}`);
        response = await fetch(`/api/admin/invoices/${invoice.number}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
          credentials: "include",
        });
      } else {
        // Create new invoice
        console.log(`✨ Creating new invoice: ${invoice.number}`);
        response = await fetch("/api/admin/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
          credentials: "include",
        });
      }

      if (response.status === 401) {
        addToast({
          description: "Session expired. Please log in again.",
          color: "danger",
        });
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      console.log("📥 Server response:", data);

      if (data.success) {
        setIsInvoiceSaved(true);
        setSavedInvoiceId(data.invoice.id);
        setHasUnsavedChanges(false);

        // Store the saved data for comparison
        const savedFormData: InvoiceFormData = {
          billTo,
          shipTo,
          invoice,
          yourCompany,
          items,
          taxPercentage,
          taxAmount,
          subTotal,
          grandTotal,
          notes,
          selectedCurrency,
          signature,
          websiteUrl,
          paymentStatus,
        };
        setLastSavedData(savedFormData);

        if (!silent) {
          addToast({
            description: isInvoiceSaved
              ? `Invoice ${invoice.number} updated successfully!`
              : `Invoice ${invoice.number} saved to database!`,
            color: "success",
          });
        } else {
          addToast({
            description: `Invoice ${invoice.number} auto-saved to database!`,
            color: "success",
          });
        }
      } else {
        console.error("❌ Server error:", data.message);
        if (!silent)
          addToast({
            description: data.message || "Failed to save invoice to database",
            color: "danger",
          });
      }
    } catch (error) {
      console.error("❌ Error saving invoice:", error);
      if (!silent)
        addToast({
          description: "Failed to save invoice to database. Please try again.",
          color: "danger",
        });
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  // Track changes to invoice data
  useEffect(() => {
    if (lastSavedData) {
      const currentData: InvoiceFormData = {
        billTo,
        shipTo,
        invoice,
        yourCompany,
        items,
        taxPercentage,
        taxAmount,
        subTotal,
        grandTotal,
        notes,
        selectedCurrency,
        signature,
        websiteUrl,
        paymentStatus,
      };

      // Compare current data with last saved data
      const hasChanges =
        JSON.stringify(currentData) !== JSON.stringify(lastSavedData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [
    billTo,
    shipTo,
    invoice,
    yourCompany,
    items,
    taxPercentage,
    taxAmount,
    subTotal,
    grandTotal,
    notes,
    selectedCurrency,
    signature,
    websiteUrl,
    paymentStatus,
    lastSavedData,
  ]);

  const fetchPostDetails = async () => {
    if (!postId.trim()) {
      addToast({
        description: "Please enter a Post ID or Project ID",
        color: "danger",
      });
      return;
    }

    const trimmedId = postId.trim().toUpperCase();

    // Auto-detect whether it's a Post or Project based on ID pattern
    if (trimmedId.startsWith("PRJ-")) {
      // It's a project ID
      await fetchProjectDetails();
    } else if (trimmedId.startsWith("P-")) {
      // It's a post ID
      await fetchPostDetailsInternal();
    } else {
      addToast({
        description:
          "Invalid ID format. Use P-XXXXXXXX for Posts or PRJ-XXXXXXXX for Projects",
        color: "danger",
      });
      return;
    }
  };

  const fetchProjectDetails = async () => {
    if (!postId.trim()) {
      addToast({ description: "Please enter a Project ID", color: "danger" });
      return;
    }

    setIsFetchingPost(true);
    try {
      // Use admin-specific endpoint for projects
      const response = await fetch(`/api/admin/projects/${postId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          addToast({ description: "Project not found", color: "danger" });
        } else if (response.status === 401) {
          addToast({
            description:
              "Unauthorized access. Please make sure you're logged in.",
            color: "danger",
          });
        } else {
          addToast({
            description: "Failed to fetch project details",
            color: "danger",
          });
        }
        return;
      }

      const data = await response.json();
      const project = data.project;
      console.log("📋 Fetched project data:", project);

      // Populate Bill To section with client/project details
      const billToData = {
        name: project.name || project.clientDetails?.name || "N/A",
        address:
          project.preferredLocation || project.clientDetails?.location || "N/A",
        phone: project.phone || project.clientDetails?.phone || "N/A",
      };
      console.log("📋 Setting Bill To:", billToData);
      setBillTo(billToData);

      // Auto-fill Invoice Information
      const currentDate = new Date();
      const invoiceDate = currentDate.toISOString().split("T")[0];

      // Calculate due date based on deadline or default 7 days
      const dueDate = new Date(currentDate);
      dueDate.setDate(dueDate.getDate() + 7);
      const dueDateString = dueDate.toISOString().split("T")[0];

      // Generate invoice number - keep existing or generate new
      const existingInvoiceNumber = invoice.number;
      const invoiceNumber =
        existingInvoiceNumber || generateRandomInvoiceNumber();

      setInvoice({
        date: invoiceDate,
        paymentDate: dueDateString,
        number: invoiceNumber,
      });

      // Set payment status to unpaid by default
      setPaymentStatus("unpaid");

      // Determine budget for the invoice item
      let budgetAmount = 0;
      let budgetDescription = "";

      if (project.budgetType === "fixed" && project.budgetAmount) {
        budgetAmount = project.budgetAmount;
        budgetDescription = "Fixed Price";
      } else if (
        project.budgetType === "hourly" &&
        project.budgetRangeMin &&
        project.budgetRangeMax
      ) {
        budgetAmount = project.budgetRangeMax; // Use max for invoice
        budgetDescription = `Hourly (${project.budgetRangeMin}-${project.budgetRangeMax})`;
      } else if (project.budgetRangeMin && project.budgetRangeMax) {
        budgetAmount = project.budgetRangeMax;
        budgetDescription = `Range (${project.budgetRangeMin}-${project.budgetRangeMax})`;
      }

      // Create invoice item from project details
      const projectItem: InvoiceItem = {
        name: project.projectTitle || "Project",
        description: `${project.category}${project.subcategory ? " - " + project.subcategory : ""} | ${project.projectType} | ${budgetDescription} | ${project.experienceLevel} level | Skills: ${project.requiredSkills?.slice(0, 3).join(", ") || "N/A"}`,
        quantity: 1,
        amount: budgetAmount,
        total: budgetAmount,
      };

      // Add the item to items array
      setItems([projectItem]);

      // Set notes from project description or default
      // if (project.description) {
      //   setNotes(project.description.substring(0, 200)); // Limit to 200 chars
      // }

      addToast({
        description: `Project ${postId} details loaded successfully!`,
        color: "success",
      });

      // Clear any existing auto-save timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      // Set up auto-save after 5 seconds
      const timer = setTimeout(() => {
        console.log("🔄 Auto-saving invoice after 5 seconds...");
        autoSaveInvoice(true); // silent save
      }, 5000);

      setAutoSaveTimer(timer);
    } catch (error) {
      console.error("Error fetching project:", error);
      addToast({
        description: "Failed to fetch project details. Please try again.",
        color: "danger",
      });
    } finally {
      setIsFetchingPost(false);
    }
  };

  const fetchPostDetailsInternal = async () => {
    if (!postId.trim()) {
      addToast({ description: "Please enter a Post ID", color: "danger" });
      return;
    }

    setIsFetchingPost(true);
    try {
      // Use admin-specific endpoint that doesn't require strict authentication
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          addToast({ description: "Post not found", color: "danger" });
        } else if (response.status === 401) {
          addToast({
            description:
              "Unauthorized access. Please make sure you're logged in.",
            color: "danger",
          });
        } else {
          addToast({
            description: "Failed to fetch post details",
            color: "danger",
          });
        }
        return;
      }
      const data = await response.json();
      const post = data.post;
      console.log("📋 Fetched post data:", post);
      console.log("📋 Bill To values:", {
        name: post.name,
        location: post.location,
        phone: post.phone,
        guardianDetailsName: post.guardianDetails?.name,
        guardianDetailsLocation: post.guardianDetails?.location,
        guardianDetailsPhone: post.guardianDetails?.phone,
      });

      // Populate Bill To section with guardian/post details
      const billToData = {
        name: post.name || post.guardianDetails?.name || "N/A",
        address: post.location || post.guardianDetails?.location || "N/A",
        phone: post.phone || post.guardianDetails?.phone || "N/A",
      };
      console.log("📋 Setting Bill To:", billToData);
      setBillTo(billToData);

      // Auto-fill Invoice Information
      const currentDate = new Date();
      const invoiceDate = currentDate.toISOString().split("T")[0];

      // Calculate due date (3 days from today)
      const dueDate = new Date(currentDate);
      dueDate.setDate(dueDate.getDate() + 3);
      const dueDateString = dueDate.toISOString().split("T")[0];

      // Generate invoice number - keep existing or generate new
      const existingInvoiceNumber = invoice.number;
      const invoiceNumber =
        existingInvoiceNumber || generateRandomInvoiceNumber();

      setInvoice({
        date: invoiceDate,
        paymentDate: dueDateString,
        number: invoiceNumber,
      });

      // Set payment status to unpaid by default
      setPaymentStatus("unpaid");

      // Create invoice item from post details with additional post information
      const postItem: InvoiceItem = {
        name: `${post.subject} - Class ${post.className}`,
        description: `${post.classType} tutoring | ${
          post.frequencyPerWeek
        } per week | ${post.board || "N/A"} board`,
        quantity: 1,
        amount: post.monthlyBudget || 0,
        total: post.monthlyBudget || 0,
        postDetails: {
          postId: post.postId,
          preferredTime: post.preferredTime,
          preferredDays: post.preferredDays || [],
          location: post.location,
        },
      };

      // Add the item to items array
      setItems([postItem]);

      // Set notes from post notes
      // if (post.notes) {
      //   setNotes(post.notes);
      // }

      addToast({
        description: `Post ${postId} details loaded successfully!`,
        color: "success",
      });

      // Clear any existing auto-save timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      // Set up auto-save after 5 seconds
      const timer = setTimeout(() => {
        console.log("🔄 Auto-saving invoice after 5 seconds...");
        autoSaveInvoice(true); // silent save
      }, 5000);

      setAutoSaveTimer(timer);
    } catch (error) {
      console.error("Error fetching post:", error);
      addToast({
        description: "Failed to fetch post details. Please try again.",
        color: "danger",
      });
    } finally {
      setIsFetchingPost(false);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  const handleDownloadPDF = async () => {
    if (!isDownloading) {
      setIsDownloading(true);
      try {
        const formData: InvoiceFormData = {
          billTo,
          shipTo,
          invoice,
          yourCompany,
          items,
          taxPercentage,
          taxAmount,
          subTotal,
          grandTotal,
          notes,
          selectedCurrency,
          signature,
          websiteUrl,
          paymentStatus,
        };
        await generatePDF(formData, currentTemplate);
        addToast({
          description: "Invoice PDF downloaded successfully!",
          color: "success",
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        addToast({
          description:
            error instanceof Error
              ? error.message
              : "Failed to generate PDF. Please try again.",
          color: "danger",
        });
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleSaveInvoice = async () => {
    await autoSaveInvoice(false); // non-silent save (show loading and full toast)
  };

  // const fillDummyData = () => {
  //   setBillTo({
  //     name: "John Doe",
  //     address: "123 Main St, Anytown, USA",
  //     phone: "(555) 123-4567",
  //   });
  //   setShipTo({
  //     name: "Jane Smith",
  //     address: "456 Elm St, Othertown, USA",
  //     phone: "(555) 987-6543",
  //   });
  //   setInvoice({
  //     date: new Date().toISOString().split("T")[0],
  //     paymentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  //       .toISOString()
  //       .split("T")[0],
  //     number: generateRandomInvoiceNumber(),
  //   });
  //   setYourCompany({
  //     name: siteConfig.name || "Your Company name",
  //     address: siteConfig.contact.address.street || "Your Company Address",
  //     phone: siteConfig.contact.phone || "Your Company Phone",
  //   });
  //   setItems([
  //     {
  //       name: "Product A",
  //       description: "High-quality item",
  //       quantity: 2,
  //       amount: 50,
  //       total: 100,
  //     },
  //     {
  //       name: "Service B",
  //       description: "Professional service",
  //       quantity: 1,
  //       amount: 200,
  //       total: 200,
  //     },
  //   ]);
  //   setTaxPercentage(10);
  //   setNotes("Thank you for your business!");
  // };

  const clearForm = () => {
    setBillTo({ name: "", address: "", phone: "" });
    setShipTo({ name: "", address: "", phone: "" });
    setInvoice({
      date: "",
      paymentDate: "",
      number: generateRandomInvoiceNumber(),
    });
    setYourCompany({ name: "", address: "", phone: "" });
    setItems([]);
    setTaxPercentage(0);
    setNotes("");
    setSignature("/api/v1/admin/private-image?name=sign.png");
    setWebsiteUrl(siteConfig.url || "https://www.aotf.in");
    setPaymentStatus("unpaid");
    setIsInvoiceSaved(false);
    setSavedInvoiceId("");
    localStorage.removeItem("adminInvoiceFormData");
  };

  const formData: InvoiceFormData = {
    billTo,
    shipTo,
    invoice,
    yourCompany,
    items,
    taxPercentage,
    taxAmount,
    subTotal,
    grandTotal,
    notes,
    selectedCurrency,
    signature,
    websiteUrl,
    paymentStatus,
  };

  if (showPreview) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => setShowPreview(false)}>
            <Edit className="mr-2 h-4 w-4" /> Back to Form
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
        {/* <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-4">
            {templates.map((template, index) => (
              <div
                key={index}
                className={`cursor-pointer p-4 border rounded transition-all ${
                  currentTemplate === index + 1
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setCurrentTemplate(index + 1)}
              >
                <p className="text-sm font-medium">{template.name}</p>
              </div>
            ))}
          </div>
        </div> */}{" "}
        <div className="overflow-scroll">
          <div className="w-[210mm] h-[297mm] mx-auto border shadow-lg bg-white overflow-hidden invoice-preview-container">
            <InvoiceTemplate data={formData} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-2 pb-24">
      <div className="mb-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Invoice Generator</h1>
            <Link href="/admin/invoices/list">
              <Button variant="bordered" isIconOnly>
                <List />
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground mt-2">
            Create and manage professional invoices for your business
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <Card className="w-full p-3">
          <form>
            {/* Post/Project ID Fetch Section */}
            <div className="mb-6 p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Search className="h-5 w-5" />
                Load Post/Project Details
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Enter a Post ID or Project ID to automatically populate invoice
                details
              </p>{" "}
              <div className="flex justify-between w-full">
                <FloatingLabelInput
                  id="postIdInput"
                  label="Post/Project ID"
                  value={postId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPostId(e.target.value.trim())
                  }
                  name="postId"
                />
                <Button
                  isIconOnly
                  type="button"
                  onClick={fetchPostDetails}
                  disabled={isFetchingPost || !postId.trim()}
                >
                  {isFetchingPost ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Supports both Post IDs (P-XXXXXXXX) and Project IDs
                (PRJ-XXXXXXXX). This will auto-fill Bill To, Invoice Information
                (with unpaid status), Items, and Notes based on the post or
                project details.
              </p>
            </div>

            <BillToSection
              billTo={billTo}
              handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleInputChange(setBillTo)(e);
                setHasUnsavedChanges(true);
              }}
            />

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Invoice Information</h2>
                {isInvoiceSaved && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Saved to Database</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="relative">
                    <FloatingLabelInput
                      id="invoiceNumber"
                      label="Invoice Number"
                      value={invoice.number}
                      onChange={() => {
                        // Read-only, no changes allowed
                      }}
                      name="number"
                      className="font-mono text-lg font-bold tracking-wider opacity-70"
                      disabled={true}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generated automatically from Post ID
                  </p>
                </div>
                <FloatingLabelInput
                  id="invoiceDate"
                  label="Invoice Date"
                  type="date"
                  value={invoice.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleInputChange(setInvoice)(e);
                    setHasUnsavedChanges(true);
                  }}
                  name="date"
                />
                <FloatingLabelInput
                  id="paymentDate"
                  label={
                    paymentStatus === "unpaid" ? "Due Date" : "Payment Date"
                  }
                  type="date"
                  value={invoice.paymentDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleInputChange(setInvoice)(e);
                    setHasUnsavedChanges(true);
                  }}
                  name="paymentDate"
                />
              </div>

              {/* Payment Status */}
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Payment Status</h3>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="paid"
                      checked={paymentStatus === "paid"}
                      onChange={(e) => {
                        setPaymentStatus(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-4 h-4"
                    />
                    <span>Paid</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="unpaid"
                      checked={paymentStatus === "unpaid"}
                      onChange={(e) => {
                        setPaymentStatus(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-4 h-4"
                    />
                    <span>Unpaid</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This will show paid/unpaid stamp on the invoice
                </p>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  onClick={handleSaveInvoice}
                  disabled={isSaving}
                  variant={
                    isInvoiceSaved && !hasUnsavedChanges ? "bordered" : "solid"
                  }
                  className="w-full md:w-auto"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isInvoiceSaved && !hasUnsavedChanges ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Saved to Database
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save to Database
                    </>
                  )}
                </Button>
                {hasUnsavedChanges && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                    You have unsaved changes
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Invoice auto-saves 5 seconds after loading post details.
                  Click Save to update manually.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Your Company</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingLabelInput
                  id="yourCompanyName"
                  label="Name"
                  value={yourCompany.name}
                  onChange={handleInputChange(setYourCompany)}
                  name="name"
                />
                <FloatingLabelInput
                  id="yourCompanyPhone"
                  label="Phone"
                  value={yourCompany.phone}
                  onChange={handleInputChange(setYourCompany)}
                  name="phone"
                />
              </div>
              <FloatingLabelInput
                id="yourCompanyAddress"
                label="Address"
                value={yourCompany.address}
                onChange={handleInputChange(setYourCompany)}
                name="address"
                className="mt-4"
              />
            </div>

            <ItemDetails
              items={items}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              currencyCode={selectedCurrency}
            />

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Totals</h3>
              <div className="flex justify-between mb-2">
                <span>Sub Total:</span>
                <span>{formatCurrency(subTotal, selectedCurrency)}</span>
              </div>
              {/* <div className="flex justify-between mb-2">
                <span>Tax Rate (%):</span>
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={handleTaxPercentageChange}
                  className="w-24 p-2 border rounded"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div> */}
              {/* <div className="flex justify-between mb-2">
                <span>Tax Amount:</span>
                <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
              </div> */}
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal, selectedCurrency)}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-medium">Notes</h3>
                <Button
                  type="button"
                  onClick={refreshNotes}
                  variant="ghost"
                  isIconOnly
                  className="ml-2"
                  title="Refresh Notes"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full p-2 border rounded min-h-25"
                rows={4}
                placeholder="Add any notes or terms..."
              />
            </div>

            {/* <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Website URL</h3>
              <FloatingLabelInput
                id="websiteUrl"
                label="Website URL (for logo hyperlink)"
                value={websiteUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setWebsiteUrl(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                name="websiteUrl"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This URL will be linked to your company logo in the PDF
              </p>
            </div> */}

            {/* <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Digital Signature</h3>
              <div className="border rounded-lg p-4 bg-background">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Using fixed signature image
                  </span>
                </div>                <div className="border rounded bg-white p-4 flex items-center justify-center">
                  <Image
                    src="/api/v1/admin/private-image?name=sign.png"
                    alt="Signature"
                    className="max-h-32 object-contain"
                    width={128}
                    height={128}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Signature image: Protected (accessible only to admins)
                </p>
              </div>
            </div> */}
          </form>
          <div className="mt-6 grid grid-cols-2 md:flex-row justify-center gap-3">
            <Button
              onClick={clearForm}
              variant="solid"
              color="danger"
              className="w-full max-w-xs"
            >
              <Trash2 />
              Clear
            </Button>
            <Button
              onClick={() => setShowPreview(true)}
              className="w-full max-w-xs"
            >
              <Eye />
              Preview
            </Button>
          </div>
        </Card>

        {/* Template Gallery Section */}
        {/* <div className="w-full lg:w-1/2 bg-card p-6 rounded-lg shadow-md border">
          <h2 className="text-2xl font-semibold mb-4">Template Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <div
                key={index}
                className="template-card bg-muted p-4 rounded-lg cursor-pointer hover:shadow-lg hover:bg-muted/80 transition-all duration-300 border"
                onClick={() => handleTemplateClick(index + 1)}
              >
                <div className="aspect-[3/4] bg-background rounded mb-2 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-center font-medium text-sm">
                  {template.name}
                </p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}
