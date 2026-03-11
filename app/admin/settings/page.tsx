"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Tabs, Tab } from "@heroui/tabs";
import { Switch } from "@heroui/switch";
import { Avatar } from "@heroui/avatar";
import { Tooltip } from "@heroui/tooltip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";
import {
  Settings,
  Shield,
  Bell,
  FileText,
  UserPlus,
  Trash2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Save,
  RotateCcw,
  Users,
  Crown,
  Headset,
  Building2,
  Globe,
  CreditCard,
  Percent,
  IndianRupee,
  Clock,
  BellRing,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  Copy,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { siteConfig } from "@/config/site";

// Inline admin roles to avoid importing Mongoose (server-only) into a client component
const ADMIN_ROLES = ["super_admin", "support_admin"] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

type SettingsTab = "accounts" | "notifications" | "terms";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockAdmins: AdminAccount[] = [
  {
    id: "adm-001",
    name: "Soumyadip Ghosh",
    email: "soumyadip@aotf.in",
    phone: "6290338214",
    role: "super_admin",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2026-03-01T14:30:00Z",
  },
  {
    id: "adm-002",
    name: "Pritam Mahata",
    email: "pritam@aotf.in",
    phone: "9876543210",
    role: "super_admin",
    status: "active",
    createdAt: "2024-06-15T00:00:00Z",
    lastLogin: "2026-03-02T09:15:00Z",
  },
  {
    id: "adm-003",
    name: "Anita Roy",
    email: "anita@aotf.in",
    phone: "9876543211",
    role: "support_admin",
    status: "active",
    createdAt: "2025-02-10T00:00:00Z",
    lastLogin: "2026-02-28T18:45:00Z",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleConfig: Record<
  AdminRole,
  { label: string; color: "danger" | "primary"; icon: React.ReactNode }
> = {
  super_admin: {
    label: "Super Admin",
    color: "danger",
    icon: <Crown size={14} />,
  },
  support_admin: {
    label: "Support Admin",
    color: "primary",
    icon: <Headset size={14} />,
  },
};

function formatDate(d?: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d?: string): string {
  if (!d) return "Never";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("accounts");

  return (
    <div className="container mx-auto px-4 max-w-5xl space-y-2">
      {/* Header */}
      <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
        <Settings size={24} className="text-default-500" />
        Settings
      </h1>

      {/* Tab Navigation */}
      <div className="w-full flex justify-center">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as SettingsTab)}
          aria-label="Settings sections"
          color="primary"
          variant="underlined"
          classNames={{
            tabList:
              "gap-1 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-2 h-12",
            tabContent: "group-data-[selected=true]:text-primary",
          }}
        >
          <Tab
            key="accounts"
            title={
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>Admin Accounts</span>
              </div>
            }
          />
          <Tab
            key="notifications"
            title={
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <span>Notifications</span>
              </div>
            }
          />
        </Tabs>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "accounts" && <AdminAccountsSection />}
          {activeTab === "notifications" && <NotificationSettingsSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 1: Admin Accounts
// ═════════════════════════════════════════════════════════════════════════════

function AdminAccountsSection() {
  const [admins, setAdmins] = useState<AdminAccount[]>(mockAdmins);
  const [searchTerm, setSearchTerm] = useState("");

  // Add Admin modal
  const {
    isOpen: isAddOpen,
    onOpen: openAdd,
    onClose: closeAdd,
  } = useDisclosure();
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    role: "support_admin" as AdminRole,
    password: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Delete modal
  const {
    isOpen: isDeleteOpen,
    onOpen: openDelete,
    onClose: closeDelete,
  } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Password change modal
  const {
    isOpen: isPwdOpen,
    onOpen: openPwd,
    onClose: closePwd,
  } = useDisclosure();
  const [pwdTarget, setPwdTarget] = useState<AdminAccount | null>(null);
  const [pwdForm, setPwdForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

  // Filtered admins
  const filteredAdmins = useMemo(() => {
    if (!searchTerm.trim()) return admins;
    const q = searchTerm.toLowerCase();
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        a.id.includes(q)
    );
  }, [admins, searchTerm]);

  const superAdminCount = admins.filter((a) => a.role === "super_admin").length;
  const supportAdminCount = admins.filter(
    (a) => a.role === "support_admin"
  ).length;

  // ── Add Admin ──────────────────────────────────────────────────────────

  const validateAddForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newAdmin.name.trim()) errors.name = "Name is required";
    else if (!/^[a-zA-Z\s]+$/.test(newAdmin.name.trim()))
      errors.name = "Name can only contain letters and spaces";
    if (!newAdmin.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email.trim()))
      errors.email = "Enter a valid email";
    else if (
      admins.some(
        (a) => a.email.toLowerCase() === newAdmin.email.trim().toLowerCase()
      )
    )
      errors.email = "An admin with this email already exists";
    if (!newAdmin.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(newAdmin.phone.trim()))
      errors.phone = "Enter a valid 10-digit phone number";
    if (!newAdmin.password) errors.password = "Password is required";
    else if (newAdmin.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    if (newAdmin.password !== newAdmin.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAdmin = async () => {
    if (!validateAddForm()) return;
    setIsAdding(true);
    try {
      // TODO: wire to real API
      await new Promise((r) => setTimeout(r, 800));
      const admin: AdminAccount = {
        id: `adm-${String(admins.length + 1).padStart(3, "0")}`,
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim().toLowerCase(),
        phone: newAdmin.phone.trim(),
        role: newAdmin.role,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      setAdmins((prev) => [...prev, admin]);
      addToast({
        description: `Admin "${admin.name}" created successfully`,
        color: "success",
      });
      setNewAdmin({
        name: "",
        email: "",
        phone: "",
        role: "support_admin",
        password: "",
        confirmPassword: "",
      });
      setAddErrors({});
      closeAdd();
    } catch {
      addToast({ description: "Failed to create admin", color: "danger" });
    } finally {
      setIsAdding(false);
    }
  };

  // ── Delete Admin ───────────────────────────────────────────────────────

  const handleDeleteClick = (admin: AdminAccount) => {
    setDeleteTarget(admin);
    openDelete();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // TODO: wire to real API
      await new Promise((r) => setTimeout(r, 600));
      setAdmins((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      addToast({
        description: `Admin "${deleteTarget.name}" deleted`,
        color: "success",
      });
      closeDelete();
      setDeleteTarget(null);
    } catch {
      addToast({ description: "Failed to delete admin", color: "danger" });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Change Password ────────────────────────────────────────────────────

  const openChangePassword = (admin: AdminAccount) => {
    setPwdTarget(admin);
    setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPwdErrors({});
    setShowOldPwd(false);
    setShowNewPwd(false);
    openPwd();
  };

  const validatePwdForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!pwdForm.oldPassword)
      errors.oldPassword = "Current password is required";
    if (!pwdForm.newPassword) errors.newPassword = "New password is required";
    else if (pwdForm.newPassword.length < 8)
      errors.newPassword = "Password must be at least 8 characters";
    else if (pwdForm.newPassword === pwdForm.oldPassword)
      errors.newPassword = "New password must differ from current password";
    if (pwdForm.newPassword !== pwdForm.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setPwdErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePwdForm()) return;
    setIsChangingPwd(true);
    try {
      // TODO: wire to real API
      await new Promise((r) => setTimeout(r, 800));
      addToast({
        description: `Password updated for ${pwdTarget?.name}`,
        color: "success",
      });
      closePwd();
      setPwdTarget(null);
    } catch {
      addToast({
        description: "Failed to change password",
        color: "danger",
      });
    } finally {
      setIsChangingPwd(false);
    }
  };

  // ── Toggle Status ──────────────────────────────────────────────────────

  const toggleAdminStatus = (admin: AdminAccount) => {
    setAdmins((prev) =>
      prev.map((a) =>
        a.id === admin.id
          ? { ...a, status: a.status === "active" ? "inactive" : "active" }
          : a
      )
    );
    addToast({
      description: `${admin.name} ${admin.status === "active" ? "deactivated" : "activated"}`,
      color: "success",
    });
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    addToast({ description: `Copied ${id}`, color: "primary" });
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap items-center gap-3">
        <Chip variant="flat" color="danger" startContent={<Crown size={14} />}>
          {superAdminCount} Super Admin{superAdminCount !== 1 ? "s" : ""}
        </Chip>
        <Chip
          variant="flat"
          color="primary"
          startContent={<Headset size={14} />}
        >
          {supportAdminCount} Support Admin
          {supportAdminCount !== 1 ? "s" : ""}
        </Chip>
        <Button
          color="primary"
          startContent={<UserPlus size={16} />}
          onPress={openAdd}
          size="sm"
        >
          Add Admin
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by name, email, phone or ID…"
        value={searchTerm}
        onValueChange={setSearchTerm}
        variant="bordered"
        size="sm"
        isClearable
        onClear={() => setSearchTerm("")}
        classNames={{ inputWrapper: "bg-default-50" }}
      />

      {/* Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAdmins.map((admin) => (
          <AdminCard
            key={admin.id}
            admin={admin}
            onDelete={handleDeleteClick}
            onChangePassword={openChangePassword}
            onToggleStatus={toggleAdminStatus}
            onCopyId={copyId}
            canDelete={!(admin.role === "super_admin" && superAdminCount <= 1)}
          />
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <Card>
          <CardBody className="py-12 text-center">
            <Users size={48} className="mx-auto text-default-300 mb-3" />
            <p className="text-default-500">
              {searchTerm
                ? "No admins match your search"
                : "No admin accounts found"}
            </p>
          </CardBody>
        </Card>
      )}

      {/* ────────── Add Admin Modal ────────── */}
      <Modal
        isOpen={isAddOpen}
        onClose={closeAdd}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            Add New Admin
          </ModalHeader>
          <ModalBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={newAdmin.name}
                onValueChange={(v) => {
                  setNewAdmin((p) => ({ ...p, name: v }));
                  setAddErrors((e) => {
                    const n = { ...e };
                    delete n.name;
                    return n;
                  });
                }}
                isRequired
                variant="bordered"
                isInvalid={!!addErrors.name}
                errorMessage={addErrors.name}
                startContent={<Users size={16} className="text-default-400" />}
              />
              <Select
                label="Role"
                selectedKeys={[newAdmin.role]}
                onChange={(e) =>
                  setNewAdmin((p) => ({
                    ...p,
                    role: e.target.value as AdminRole,
                  }))
                }
                variant="bordered"
                isRequired
                startContent={
                  newAdmin.role === "super_admin" ? (
                    <Crown size={16} className="text-danger" />
                  ) : (
                    <Headset size={16} className="text-primary" />
                  )
                }
              >
                {ADMIN_ROLES.map((role) => (
                  <SelectItem key={role}>{roleConfig[role].label}</SelectItem>
                ))}
              </Select>
            </div>

            <Input
              label="Email Address"
              placeholder="admin@aotf.in"
              type="email"
              value={newAdmin.email}
              onValueChange={(v) => {
                setNewAdmin((p) => ({ ...p, email: v }));
                setAddErrors((e) => {
                  const n = { ...e };
                  delete n.email;
                  return n;
                });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!addErrors.email}
              errorMessage={addErrors.email}
              startContent={<Mail size={16} className="text-default-400" />}
            />

            <Input
              label="Phone Number"
              placeholder="9876543210"
              type="tel"
              value={newAdmin.phone}
              onValueChange={(v) => {
                setNewAdmin((p) => ({ ...p, phone: v }));
                setAddErrors((e) => {
                  const n = { ...e };
                  delete n.phone;
                  return n;
                });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!addErrors.phone}
              errorMessage={addErrors.phone}
              startContent={<Phone size={16} className="text-default-400" />}
            />

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Password"
                placeholder="Min. 8 characters"
                type={showNewPassword ? "text" : "password"}
                value={newAdmin.password}
                onValueChange={(v) => {
                  setNewAdmin((p) => ({ ...p, password: v }));
                  setAddErrors((e) => {
                    const n = { ...e };
                    delete n.password;
                    return n;
                  });
                }}
                isRequired
                variant="bordered"
                isInvalid={!!addErrors.password}
                errorMessage={addErrors.password}
                startContent={<Lock size={16} className="text-default-400" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={16} className="text-default-400" />
                    ) : (
                      <Eye size={16} className="text-default-400" />
                    )}
                  </button>
                }
              />
              <Input
                label="Confirm Password"
                placeholder="Re-enter password"
                type={showNewPassword ? "text" : "password"}
                value={newAdmin.confirmPassword}
                onValueChange={(v) => {
                  setNewAdmin((p) => ({ ...p, confirmPassword: v }));
                  setAddErrors((e) => {
                    const n = { ...e };
                    delete n.confirmPassword;
                    return n;
                  });
                }}
                isRequired
                variant="bordered"
                isInvalid={!!addErrors.confirmPassword}
                errorMessage={addErrors.confirmPassword}
                startContent={<Lock size={16} className="text-default-400" />}
              />
            </div>

            {/* Role description */}
            <Card className="bg-default-50">
              <CardBody className="py-3 text-sm text-default-600 space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <Info size={14} className="text-primary" />
                  Role Permissions
                </div>
                <p>
                  <span className="font-medium text-danger">Super Admin</span> —
                  Full access: manage all posts, enquiries, ads, settings, and
                  other admins.
                </p>
                <p>
                  <span className="font-medium text-primary">
                    Support Admin
                  </span>{" "}
                  — Limited access: manage enquiries, update post statuses, view
                  analytics. Cannot manage admins or settings.
                </p>
              </CardBody>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeAdd} isDisabled={isAdding}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddAdmin}
              isLoading={isAdding}
            >
              Create Admin
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ────────── Delete Confirmation Modal ────────── */}
      <Modal isOpen={isDeleteOpen} onClose={closeDelete}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle size={22} className="text-danger" />
              Delete Admin Account
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Are you sure you want to permanently delete this admin account?
            </p>
            {deleteTarget && (
              <Card className="mt-2 bg-danger-50/50">
                <CardBody className="gap-1">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={getInitials(deleteTarget.name)}
                      size="sm"
                      classNames={{
                        base:
                          deleteTarget.role === "super_admin"
                            ? "bg-danger/10"
                            : "bg-primary/10",
                        name:
                          deleteTarget.role === "super_admin"
                            ? "text-danger"
                            : "text-primary",
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {deleteTarget.name}
                      </p>
                      <p className="text-xs text-default-500">
                        {deleteTarget.email}
                      </p>
                    </div>
                  </div>
                  <Divider className="my-2" />
                  <p className="text-sm">
                    <span className="font-semibold">Role:</span>{" "}
                    <Chip
                      size="sm"
                      color={roleConfig[deleteTarget.role].color}
                      variant="flat"
                    >
                      {roleConfig[deleteTarget.role].label}
                    </Chip>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">ID:</span>{" "}
                    <span className="text-default-500">{deleteTarget.id}</span>
                  </p>
                </CardBody>
              </Card>
            )}
            <p className="text-sm text-danger-500 mt-2">
              This action cannot be undone. The admin will lose all access
              immediately.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={closeDelete}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={confirmDelete}
              isLoading={isDeleting}
            >
              Delete Admin
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ────────── Change Password Modal ────────── */}
      <Modal isOpen={isPwdOpen} onClose={closePwd}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Lock size={20} className="text-warning" />
            Change Password
          </ModalHeader>
          <ModalBody className="gap-4">
            {pwdTarget && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-default-50">
                <Avatar
                  name={getInitials(pwdTarget.name)}
                  size="sm"
                  classNames={{
                    base:
                      pwdTarget.role === "super_admin"
                        ? "bg-danger/10"
                        : "bg-primary/10",
                    name:
                      pwdTarget.role === "super_admin"
                        ? "text-danger"
                        : "text-primary",
                  }}
                />
                <div>
                  <p className="text-sm font-semibold">{pwdTarget.name}</p>
                  <p className="text-xs text-default-500">{pwdTarget.email}</p>
                </div>
              </div>
            )}

            <Input
              label="Current Password"
              type={showOldPwd ? "text" : "password"}
              value={pwdForm.oldPassword}
              onValueChange={(v) => {
                setPwdForm((p) => ({ ...p, oldPassword: v }));
                setPwdErrors((e) => {
                  const n = { ...e };
                  delete n.oldPassword;
                  return n;
                });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!pwdErrors.oldPassword}
              errorMessage={pwdErrors.oldPassword}
              startContent={<Lock size={16} className="text-default-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowOldPwd(!showOldPwd)}
                >
                  {showOldPwd ? (
                    <EyeOff size={16} className="text-default-400" />
                  ) : (
                    <Eye size={16} className="text-default-400" />
                  )}
                </button>
              }
            />

            <Input
              label="New Password"
              type={showNewPwd ? "text" : "password"}
              value={pwdForm.newPassword}
              onValueChange={(v) => {
                setPwdForm((p) => ({ ...p, newPassword: v }));
                setPwdErrors((e) => {
                  const n = { ...e };
                  delete n.newPassword;
                  return n;
                });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!pwdErrors.newPassword}
              errorMessage={pwdErrors.newPassword}
              description="Minimum 8 characters"
              startContent={<Lock size={16} className="text-default-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                >
                  {showNewPwd ? (
                    <EyeOff size={16} className="text-default-400" />
                  ) : (
                    <Eye size={16} className="text-default-400" />
                  )}
                </button>
              }
            />

            <Input
              label="Confirm New Password"
              type={showNewPwd ? "text" : "password"}
              value={pwdForm.confirmPassword}
              onValueChange={(v) => {
                setPwdForm((p) => ({ ...p, confirmPassword: v }));
                setPwdErrors((e) => {
                  const n = { ...e };
                  delete n.confirmPassword;
                  return n;
                });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!pwdErrors.confirmPassword}
              errorMessage={pwdErrors.confirmPassword}
              startContent={<Lock size={16} className="text-default-400" />}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={closePwd}
              isDisabled={isChangingPwd}
            >
              Cancel
            </Button>
            <Button
              color="warning"
              variant="flat"
              onPress={handleChangePassword}
              isLoading={isChangingPwd}
            >
              Update Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

// ─── Admin Card Sub-component ─────────────────────────────────────────────────

function AdminCard({
  admin,
  onDelete,
  onChangePassword,
  onToggleStatus,
  onCopyId,
  canDelete,
}: {
  admin: AdminAccount;
  onDelete: (a: AdminAccount) => void;
  onChangePassword: (a: AdminAccount) => void;
  onToggleStatus: (a: AdminAccount) => void;
  onCopyId: (id: string) => void;
  canDelete: boolean;
}) {
  const rc = roleConfig[admin.role];
  const isActive = admin.status === "active";

  return (
    <Card className="border border-divider/50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-1">
        <div className="flex items-center gap-3 w-full">
          <Avatar
            name={getInitials(admin.name)}
            size="md"
            classNames={{
              base: `${admin.role === "super_admin" ? "bg-danger/10" : "bg-primary/10"}`,
              name: `text-sm font-bold ${admin.role === "super_admin" ? "text-danger" : "text-primary"}`,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-default-900 truncate">
                {admin.name}
              </h3>
              <Chip
                size="sm"
                color={isActive ? "success" : "default"}
                variant="dot"
                classNames={{ content: "text-xs" }}
              >
                {isActive ? "Active" : "Inactive"}
              </Chip>
            </div>
            <div className="flex items-center gap-1.5">
              <Chip
                size="sm"
                color={rc.color}
                variant="flat"
                startContent={rc.icon}
                classNames={{ content: "text-xs" }}
              >
                {rc.label}
              </Chip>
              <button
                onClick={() => onCopyId(admin.id)}
                className="flex items-center gap-0.5 text-[11px] text-default-400 hover:text-primary transition-colors"
              >
                <Copy size={10} />
                {admin.id}
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-1 pb-2 space-y-2">
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-default-400 shrink-0" />
            <span className="text-default-600 truncate">{admin.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-default-400 shrink-0" />
            <span className="text-default-600">{admin.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-default-400 shrink-0" />
            <span className="text-default-500 text-xs">
              Last login: {formatDateTime(admin.lastLogin)}
            </span>
          </div>
        </div>
        <p className="text-xs text-default-400">
          Created {formatDate(admin.createdAt)}
        </p>
      </CardBody>

      <CardFooter className="gap-2 pt-0">
        <Button
          size="sm"
          variant="flat"
          color={isActive ? "warning" : "success"}
          onPress={() => onToggleStatus(admin)}
          className="flex-1"
        >
          {isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          size="sm"
          variant="flat"
          color="secondary"
          startContent={<Lock size={14} />}
          onPress={() => onChangePassword(admin)}
          className="flex-1"
        >
          Password
        </Button>
        <Tooltip
          content={
            canDelete ? "Delete admin" : "Cannot delete the only super admin"
          }
          color={canDelete ? "danger" : "default"}
        >
          <span>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              isIconOnly
              onPress={() => onDelete(admin)}
              isDisabled={!canDelete}
            >
              <Trash2 size={14} />
            </Button>
          </span>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 2: General Settings
// ═════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 3: Notification Settings
// ═════════════════════════════════════════════════════════════════════════════

function NotificationSettingsSection() {
  const [notifications, setNotifications] = useState({
    emailNewEnquiry: true,
    emailEnquiryStatusChange: true,
    emailNewApplication: true,
    emailDailyDigest: false,
    smsNewEnquiry: true,
    smsUrgentAlerts: true,
    smsApplicationUpdate: false,
    pushNewEnquiry: true,
    pushNewApplication: true,
    pushAdExpiry: true,
    pushSystemAlerts: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: wire to real API
      await new Promise((r) => setTimeout(r, 600));
      addToast({
        description: "Notification preferences saved",
        color: "success",
      });
      setIsDirty(false);
    } catch {
      addToast({
        description: "Failed to save preferences",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Save bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-3 rounded-lg bg-warning-50 border border-warning-200"
          >
            <p className="text-sm text-warning-700 font-medium">
              You have unsaved changes
            </p>
            <Button
              size="sm"
              color="primary"
              startContent={<Save size={14} />}
              onPress={handleSave}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Email Notifications</h3>
              <p className="text-xs text-default-500">
                Choose which emails you want to receive
              </p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-0">
          <NotificationToggle
            label="New Enquiry Received"
            description="Get notified when a new enquiry is submitted"
            icon={<MessageSquare size={16} className="text-primary" />}
            isSelected={notifications.emailNewEnquiry}
            onToggle={() => toggleNotification("emailNewEnquiry")}
          />
          <Divider />
          <NotificationToggle
            label="Enquiry Status Change"
            description="Notifications when enquiry status is updated"
            icon={<CheckCircle2 size={16} className="text-success" />}
            isSelected={notifications.emailEnquiryStatusChange}
            onToggle={() => toggleNotification("emailEnquiryStatusChange")}
          />
          <Divider />
          <NotificationToggle
            label="New Application"
            description="When a teacher or candidate applies to a post"
            icon={<Users size={16} className="text-warning" />}
            isSelected={notifications.emailNewApplication}
            onToggle={() => toggleNotification("emailNewApplication")}
          />
          <Divider />
          <NotificationToggle
            label="Daily Digest"
            description="A summary of all activities sent every morning"
            icon={<Clock size={16} className="text-secondary" />}
            isSelected={notifications.emailDailyDigest}
            onToggle={() => toggleNotification("emailDailyDigest")}
          />
        </CardBody>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <Smartphone size={18} className="text-success" />
            </div>
            <div>
              <h3 className="text-base font-semibold">SMS Notifications</h3>
              <p className="text-xs text-default-500">
                SMS alerts for critical events
              </p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-0">
          <NotificationToggle
            label="New Enquiry Alert"
            description="SMS when a new enquiry comes in"
            icon={<MessageSquare size={16} className="text-success" />}
            isSelected={notifications.smsNewEnquiry}
            onToggle={() => toggleNotification("smsNewEnquiry")}
          />
          <Divider />
          <NotificationToggle
            label="Urgent Alerts"
            description="Critical system and payment alerts via SMS"
            icon={<AlertTriangle size={16} className="text-danger" />}
            isSelected={notifications.smsUrgentAlerts}
            onToggle={() => toggleNotification("smsUrgentAlerts")}
          />
          <Divider />
          <NotificationToggle
            label="Application Updates"
            description="SMS when applications are approved or declined"
            icon={<CheckCircle2 size={16} className="text-primary" />}
            isSelected={notifications.smsApplicationUpdate}
            onToggle={() => toggleNotification("smsApplicationUpdate")}
          />
        </CardBody>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <BellRing size={18} className="text-warning" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Push Notifications</h3>
              <p className="text-xs text-default-500">
                In-app and browser push notifications
              </p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-0">
          <NotificationToggle
            label="New Enquiry"
            description="Push notification for new enquiries"
            icon={<MessageSquare size={16} className="text-warning" />}
            isSelected={notifications.pushNewEnquiry}
            onToggle={() => toggleNotification("pushNewEnquiry")}
          />
          <Divider />
          <NotificationToggle
            label="New Application"
            description="Push when someone applies to a post"
            icon={<Users size={16} className="text-primary" />}
            isSelected={notifications.pushNewApplication}
            onToggle={() => toggleNotification("pushNewApplication")}
          />
          <Divider />
          <NotificationToggle
            label="Ad Expiry Reminder"
            description="Reminder when an ad is about to expire"
            icon={<Clock size={16} className="text-danger" />}
            isSelected={notifications.pushAdExpiry}
            onToggle={() => toggleNotification("pushAdExpiry")}
          />
          <Divider />
          <NotificationToggle
            label="System Alerts"
            description="Critical system alerts and downtime warnings"
            icon={<AlertTriangle size={16} className="text-danger" />}
            isSelected={notifications.pushSystemAlerts}
            onToggle={() => toggleNotification("pushSystemAlerts")}
          />
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Notification Toggle Row ──────────────────────────────────────────────────

function NotificationToggle({
  label,
  description,
  icon,
  isSelected,
  onToggle,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-default-100">{icon}</div>
        <div>
          <p className="text-sm font-medium text-default-800">{label}</p>
          <p className="text-xs text-default-500">{description}</p>
        </div>
      </div>
      <Switch
        isSelected={isSelected}
        onValueChange={onToggle}
        size="sm"
        color="primary"
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 4: Consultancy Terms
// ═════════════════════════════════════════════════════════════════════════════
