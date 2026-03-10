"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminData {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
  isLocked: boolean;
}

export default function AdminHomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Get admin data from metadata or fetch from API
        const metadata = user?.publicMetadata;
        
        if (metadata?.adminId) {
          const response = await fetch(`/api/v1/admin/admins/${metadata.adminId}`);
          if (response.ok) {
            const result = await response.json();
            setAdminData(result.admin);
          }
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAdminData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "moderator":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Sub-Superadmin";
      case "moderator":
        return "Support";
      default:
        return role;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {adminData?.name || user?.firstName}!
        </p>
      </div>

      {/* Admin Info Card */}
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Your Account</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{adminData?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Username</p>
            <p className="font-medium">{adminData?.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{adminData?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <span
              className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${getRoleBadgeColor(adminData?.role || "")}`}
            >
              {getRoleLabel(adminData?.role || "")}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminData?.permissions?.canHandleEnquiries && (
            <Link
              href="/admin/enquiries"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 text-3xl">📩</div>
              <h3 className="mb-1 font-semibold">Manage Enquiries</h3>
              <p className="text-sm text-gray-600">
                View and respond to customer enquiries
              </p>
            </Link>
          )}

          {adminData?.permissions?.canHandleFeedbacks && (
            <Link
              href="/admin/feedbacks"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 text-3xl">⭐</div>
              <h3 className="mb-1 font-semibold">Manage Feedbacks</h3>
              <p className="text-sm text-gray-600">
                Review customer feedback and ratings
              </p>
            </Link>
          )}

          {adminData?.permissions?.canManagePosts && (
            <Link
              href="/admin/tuitions"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 text-3xl">📚</div>
              <h3 className="mb-1 font-semibold">Manage Tuitions</h3>
              <p className="text-sm text-gray-600">
                Create and manage tuition posts
              </p>
            </Link>
          )}

          {adminData?.permissions?.canManageJobs && (
            <Link
              href="/admin/jobs"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 text-3xl">💼</div>
              <h3 className="mb-1 font-semibold">Manage Jobs</h3>
              <p className="text-sm text-gray-600">
                Create and manage job postings
              </p>
            </Link>
          )}

          {adminData?.permissions?.canManageAdmins && (
            <Link
              href="/admin/settings"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 text-3xl">👥</div>
              <h3 className="mb-1 font-semibold">Manage Admins</h3>
              <p className="text-sm text-gray-600">
                View and manage admin users
              </p>
            </Link>
          )}

          {adminData?.permissions?.canViewAnalytics && (
            <Link
              href="/admin/settings"
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 text-3xl">📊</div>
              <h3 className="mb-1 font-semibold">Analytics</h3>
              <p className="text-sm text-gray-600">
                View platform statistics and reports
              </p>
            </Link>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <p className="text-sm font-medium text-green-900">
            Admin account is active and operational
          </p>
        </div>
      </div>
    </div>
  );
}
