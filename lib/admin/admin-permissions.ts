export type AdminPermissionKey =
  | "canManageUsers"
  | "canBlockUsers"
  | "canManagePosts"
  | "canManageJobs"
  | "canCreateTuitionPosts"
  | "canCreateJobPosts"
  | "canEditPosts"
  | "canDeletePosts"
  | "canHandleEnquiries"
  | "canHandleFeedbacks"
  | "canUpdateEnquiryStatus"
  | "canCallApplicants"
  | "canProcessRefunds"
  | "canViewPayments"
  | "canViewAnalytics"
  | "canExportData"
  | "canManageAdmins"
  | "canCreateAdmins"
  | "canEditAdmins"
  | "canDeactivateAdmins"
  | "canResetAdminPasswords"
  | "canTerminateAdmins"
  | "canViewAuditLogs";

export const ADMIN_PERMISSION_CATALOG: Array<{
  key: AdminPermissionKey;
  label: string;
  group: "users" | "content" | "support" | "finance" | "analytics" | "admin";
}> = [
  { key: "canManageUsers", label: "Manage users", group: "users" },
  { key: "canBlockUsers", label: "Block users", group: "users" },
  { key: "canManagePosts", label: "Manage posts", group: "content" },
  { key: "canManageJobs", label: "Manage jobs", group: "content" },
  { key: "canCreateTuitionPosts", label: "Create tuition posts", group: "content" },
  { key: "canCreateJobPosts", label: "Create job posts", group: "content" },
  { key: "canEditPosts", label: "Edit posts", group: "content" },
  { key: "canDeletePosts", label: "Delete posts", group: "content" },
  { key: "canHandleEnquiries", label: "Handle enquiries", group: "support" },
  { key: "canHandleFeedbacks", label: "Handle feedback", group: "support" },
  { key: "canUpdateEnquiryStatus", label: "Update enquiry status", group: "support" },
  { key: "canCallApplicants", label: "Call applicants", group: "support" },
  { key: "canProcessRefunds", label: "Process refunds", group: "finance" },
  { key: "canViewPayments", label: "View payments", group: "finance" },
  { key: "canViewAnalytics", label: "View analytics", group: "analytics" },
  { key: "canExportData", label: "Export data", group: "analytics" },
  { key: "canManageAdmins", label: "Manage admins", group: "admin" },
  { key: "canCreateAdmins", label: "Create admins", group: "admin" },
  { key: "canEditAdmins", label: "Edit admins", group: "admin" },
  { key: "canDeactivateAdmins", label: "Deactivate admins", group: "admin" },
  { key: "canResetAdminPasswords", label: "Reset admin passwords", group: "admin" },
  { key: "canTerminateAdmins", label: "Terminate admins", group: "admin" },
  { key: "canViewAuditLogs", label: "View audit logs", group: "admin" },
];

export const ADMIN_PERMISSION_KEYS = ADMIN_PERMISSION_CATALOG.map(
  (item) => item.key,
);