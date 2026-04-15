"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { RefreshCw, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/BackButton";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentDate: string;
  paymentStatus: "paid" | "unpaid";
  billTo: {
    name: string;
    address: string;
    phone: string;
  };
  grandTotal: number;
  currency: string;
  postId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchInvoices = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      const response = await fetch(`/api/admin/invoices?${params.toString()}`, {
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setInvoices(data.invoices);
        setPagination(data.pagination);
      } else {
        addToast({ description: "Failed to fetch invoices", color: "danger" });
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      addToast({ description: "Failed to fetch invoices", color: "danger" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInvoices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleDelete = async (invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceNumber}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        addToast({
          description: "Invoice deleted successfully",
          color: "success",
        });
        fetchInvoices(pagination.page);
      } else {
        addToast({
          description: data.message || "Failed to delete invoice",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      addToast({ description: "Failed to delete invoice", color: "danger" });
    }
  };

  return (
    <div className="container mx-auto px-4">
      <BackButton title="Invoices" />
      <div className="flex flex-col justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Invoices</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all saved invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchInvoices(pagination.page)}
            variant="solid"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/invoices">
            <Button>Create New Invoice</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <span className="text-sm font-medium">Filter by status:</span>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "solid" : "bordered"}
            onClick={() => setFilterStatus("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "paid" ? "solid" : "bordered"}
            onClick={() => setFilterStatus("paid")}
            size="sm"
          >
            Paid
          </Button>
          <Button
            variant={filterStatus === "unpaid" ? "solid" : "bordered"}
            onClick={() => setFilterStatus("unpaid")}
            size="sm"
          >
            Unpaid
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground mb-4">No invoices found</p>
          <Link href="/admin/invoices">
            <Button>Create Your First Invoice</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Invoices Table */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Invoice #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Invoice Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Linked ID
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="border-t hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-sm font-bold">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="font-medium">
                            {invoice.billTo.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.billTo.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(invoice.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatCurrency(invoice.grandTotal, invoice.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {invoice.paymentStatus === "paid" ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                Paid
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-orange-600" />
                              <span className="text-orange-600 font-medium">
                                Unpaid
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {invoice.postId ? (
                          <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded font-mono">
                            {invoice.postId}
                          </span>
                        ) : invoice.projectId ? (
                          <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded font-mono">
                            {invoice.projectId}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            isIconOnly
                            title="View Invoice"
                            onClick={() => {
                              // TODO: Implement view invoice functionality
                              addToast({
                                description: "View functionality coming soon!",
                                color: "default",
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            isIconOnly
                            title="Delete Invoice"
                            onClick={() => handleDelete(invoice.invoiceNumber)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="bordered"
                onClick={() => fetchInvoices(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({pagination.total} total)
                </span>
              </div>
              <Button
                variant="bordered"
                onClick={() => fetchInvoices(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
