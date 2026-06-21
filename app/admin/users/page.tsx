"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  RefreshCw,
  Ban,
  BadgeCheck,
  Trash2,
  Search,
} from "lucide-react";
import AdminSearchBar from "@/components/admin/ui/AdminSearchBar";
import { reportClientError } from "@/lib/client-report-error";

type Role = "teacher" | "candidate";
type Status = "all" | "active" | "blocked" | "deleted";

type UserData = {
  id: string;
  clerkId: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  whatsapp?: string | null;
  role: Role;
  createdAt: string;
  updatedAt?: string;
  status?: "active" | "inactive";
  statusValue: "active" | "blocked" | "deleted";
  onboardingCompleted: boolean;
  avatarUrl?: string | null;
  profileUrl: string;
  verifyUrl: string;
  location?: string | null;
  qualification?: string | null;
  board?: string | null;
};

type UsersResponse = {
  users: Array<{
    id: string;
    clerkId: string;
    username: string;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    role: "teacher" | "teacher_candidate";
    status: "active" | "blocked" | "deleted";
    onboardingCompleted: boolean;
    avatarUrl: string | null;
    profileUrl: string;
    verifyUrl: string;
    location: string | null;
    qualification: string | null;
    board: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  summary?: {
    total: number;
    active: number;
    blocked: number;
    deleted: number;
    teachers: number;
    candidates: number;
  };
};

const statusLabels: Record<Exclude<Status, "all">, string> = {
  active: "Active",
  blocked: "Blocked",
  deleted: "Deleted",
};

function toFriendlyRole(role: string): Role {
  return role === "teacher_candidate" ? "candidate" : "teacher";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function UsersPage() {
  const [selectedTab, setSelectedTab] = useState<Role>("teacher");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState<{
    total: number;
    active: number;
    blocked: number;
    deleted: number;
    teachers: number;
    candidates: number;
  } | null>(null);

  const fetchUsers = async (role: Role, status: Status) => {
    const params = new URLSearchParams();
    params.set("role", role);
    if (status !== "all") params.set("status", status);
    params.set("limit", "250");

    const res = await fetch(`/api/admin/app-users?${params.toString()}`);
    const data = (await res.json().catch(() => ({}))) as UsersResponse & {
      error?: string;
    };

    if (!res.ok) {
      throw new Error(data.error || "Failed to load users");
    }

    setUsers(
      data.users.map((user) => ({
        id: user.id,
        clerkId: user.clerkId,
        name: user.name,
        username: user.username,
        email: user.email ?? "—",
        phone: user.phone,
        whatsapp: user.whatsapp,
        role: toFriendlyRole(user.role),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        statusValue: user.status,
        status: user.status === "active" ? "active" : "inactive",
        onboardingCompleted: user.onboardingCompleted,
        avatarUrl: user.avatarUrl,
        profileUrl: user.profileUrl,
        verifyUrl: user.verifyUrl,
        location: user.location,
        qualification: user.qualification,
        board: user.board,
      })),
    );
    setSummary(data.summary ?? null);
  };

  const reloadUsers = async (silent = false) => {
    silent ? setIsRefreshing(true) : setIsLoading(true);
    setError(null);
    try {
      await fetchUsers(selectedTab, statusFilter);
    } catch (err) {
      reportClientError(err, { feature: "admin-users" });
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void reloadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        (user.phone ?? "").includes(q) ||
        (user.whatsapp ?? "").includes(q)
      );
    });
  }, [users, searchQuery]);

  const handleStatusChange = async (
    userId: string,
    nextStatus: "active" | "blocked" | "deleted",
  ) => {
    setActioningId(userId);
    try {
      const res = await fetch(`/api/admin/app-users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user status");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                statusValue: nextStatus,
                status: nextStatus === "active" ? "active" : "inactive",
              }
            : user,
        ),
      );
      addToast({
        description: `User ${statusLabels[nextStatus]} successfully`,
        color: "success",
      });
      void reloadUsers(true);
    } catch (err) {
      reportClientError(err, { feature: "admin-users", extra: { action: "update-status" } });
      addToast({
        description:
          err instanceof Error ? err.message : "Failed to update user",
        color: "danger",
      });
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="w-full space-y-2 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-sm text-default-500 mt-1">
            Manage real teacher and candidate accounts
          </p>
        </div>
      </div>
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => {
          setSelectedTab(key as Role);
          setSearchQuery("");
        }}
        aria-label="User roles"
        color="primary"
        className="w-full justify-center"
      >
        <Tab
          key="teacher"
          title={`Teachers (${summary?.teachers ?? filteredUsers.filter((u) => u.role === "teacher").length})`}
        />
        <Tab
          key="candidate"
          title={`Candidates (${summary?.candidates ?? filteredUsers.filter((u) => u.role === "candidate").length})`}
        />
      </Tabs>
      <AdminSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by name, username, email or phone…"
        onClearAll={() => {
          setSearchQuery("");
          setStatusFilter("all");
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          label="Status"
          placeholder="Filter by status"
          selectedKeys={[statusFilter]}
          className="max-w-56"
          size="sm"
          variant="bordered"
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as Status | undefined;
            setStatusFilter(value ?? "all");
          }}
        >
          <SelectItem key="all">All statuses</SelectItem>
          <SelectItem key="active">Active</SelectItem>
          <SelectItem key="blocked">Blocked</SelectItem>
          <SelectItem key="deleted">Deleted</SelectItem>
        </Select>
        <Button 
          isIconOnly
          size="md"
          variant="flat"
          color="primary"
          startContent={<RefreshCw size={16} />}
          isLoading={isRefreshing}
          onPress={() => void reloadUsers(true)}
        ></Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-default-500">
        <span className="rounded-full bg-default-100 px-3 py-1">
          {summary?.total ?? filteredUsers.length} users
        </span>
        <span className="rounded-full bg-default-100 px-3 py-1">
          {summary?.active ?? 0} active
        </span>
        <span className="rounded-full bg-default-100 px-3 py-1">
          {summary?.blocked ?? 0} blocked
        </span>
        <span className="rounded-full bg-default-100 px-3 py-1">
          {summary?.deleted ?? 0} deleted
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-danger-700 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-default-500">Loading users…</div>
      ) : null}

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="w-full border border-default-200">
            <CardHeader className="flex gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-semibold">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user.name) || (
                    <User className="text-primary" size={24} />
                  )
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-md font-semibold">{user.name}</p>
                <p className="text-small text-default-500 capitalize">
                  {user.role}
                </p>
                <p className="text-tiny text-default-400">@{user.username}</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-default-400" />
                <span className="text-default-600">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-default-400" />
                <span className="text-default-600">{user.phone ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-default-400" />
                <span className="text-default-600">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe size={16} className="text-default-400" />
                <span className="text-default-600">
                  {user.onboardingCompleted
                    ? "Onboarding complete"
                    : "Onboarding pending"}
                </span>
              </div>
            </CardBody>
            <CardFooter className="gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                className="flex-1"
                as="a"
                href={user.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Profile
              </Button>
              <Button
                size="sm"
                variant="flat"
                color={
                  user.statusValue === "active"
                    ? "success"
                    : user.statusValue === "blocked"
                      ? "warning"
                      : "default"
                }
              >
                {statusLabels[user.statusValue]}
              </Button>
            </CardFooter>
            <CardFooter className="gap-2 pt-0">
              {user.statusValue === "active" ? (
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  startContent={<Ban size={16} />}
                  className="flex-1"
                  isLoading={actioningId === user.id}
                  onPress={() => void handleStatusChange(user.id, "blocked")}
                >
                  Block
                </Button>
              ) : user.statusValue === "blocked" ? (
                <Button
                  size="sm"
                  variant="flat"
                  color="success"
                  startContent={<BadgeCheck size={16} />}
                  className="flex-1"
                  isLoading={actioningId === user.id}
                  onPress={() => void handleStatusChange(user.id, "active")}
                >
                  Unblock
                </Button>
              ) : (
                <Button size="sm" variant="flat" className="flex-1" isDisabled>
                  Deleted
                </Button>
              )}

              {user.statusValue !== "deleted" ? (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<Trash2 size={16} />}
                  isLoading={actioningId === user.id}
                  onPress={() => {
                    if (
                      window.confirm(
                        `Delete ${user.name}? This will mark the account as deleted.`,
                      )
                    ) {
                      void handleStatusChange(user.id, "deleted");
                    }
                  }}
                >
                  Delete
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        ))}
      </div>
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-default-300 mb-4" />
          <p className="text-default-500">
            No {selectedTab}s found for the current filters.
          </p>
        </div>
      )}
    </div>
  );
}
