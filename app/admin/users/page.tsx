"use client";

import React, { useState, useMemo } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import { User, Mail, Phone, Calendar, UserPlus } from "lucide-react";
import AdminSearchBar from "@/components/admin/ui/AdminSearchBar";

type Role = "teacher" | "candidate";

type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
  status?: "active" | "inactive";
};

// Mock data
const mockUsers: UserData[] = [
  {
    id: "u1",
    name: "Pritam Mahata",
    email: "pritam@example.com",
    phone: "9876543210",
    role: "teacher",
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: "u2",
    name: "Anita Sharma",
    email: "anita@example.com",
    phone: "9876543211",
    role: "teacher",
    createdAt: "2024-02-20",
    status: "active",
  },
  {
    id: "u3",
    name: "Rahul Kumar",
    email: "rahul@example.com",
    phone: "9876543212",
    role: "candidate",
    createdAt: "2024-03-10",
    status: "active",
  },
  {
    id: "u4",
    name: "Sneha Patel",
    email: "sneha@example.com",
    phone: "9876543213",
    role: "candidate",
    createdAt: "2024-03-25",
    status: "inactive",
  },
];

export default function UsersPage() {
  const [selectedTab, setSelectedTab] = useState<Role>("teacher");
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "teacher" as Role,
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (user.role !== selectedTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.includes(q)
      );
    });
  }, [users, selectedTab, searchQuery]);

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.phone) {
      addToast({ description: "Please fill all fields", color: "danger" });
      return;
    }

    const user: UserData = {
      id: `u${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setUsers([...users, user]);
    addToast({ description: "User created successfully", color: "success" });
    setNewUser({ name: "", email: "", phone: "", role: "teacher" });
    onClose();
  };

  return (
    <div className="w-full space-y-6 px-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-sm text-default-500 mt-1">
            Manage teachers and candidates
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
          title={`Teachers (${users.filter((u) => u.role === "teacher").length})`}
        />
        <Tab
          key="candidate"
          title={`Candidates (${users.filter((u) => u.role === "candidate").length})`}
        />
      </Tabs>
      <AdminSearchBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by name, email or phone…"
        resultCount={filteredUsers.length}
        resultLabel="user"
        onClearAll={() => setSearchQuery("")}
      />
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="w-full">
            <CardHeader className="flex gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="text-primary" size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-semibold">{user.name}</p>
                <p className="text-small text-default-500 capitalize">
                  {user.role}
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-default-400" />
                <span className="text-default-600">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-default-400" />
                <span className="text-default-600">{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-default-400" />
                <span className="text-default-600">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardBody>
            <CardFooter className="gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                className="flex-1"
              >
                View Profile
              </Button>
              <Button
                size="sm"
                variant="flat"
                color={user.status === "active" ? "success" : "default"}
              >
                {user.status === "active" ? "Active" : "Inactive"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-default-300 mb-4" />
          <p className="text-default-500">
            No {selectedTab}s found. Create one to get started.
          </p>
        </div>
      )}
      {/* Create User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Create New User
          </ModalHeader>
          <ModalBody>
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              isRequired
              variant="bordered"
            />
            <Input
              label="Email"
              placeholder="Enter email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              isRequired
              variant="bordered"
            />
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              type="tel"
              value={newUser.phone}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
              isRequired
              variant="bordered"
            />
            <Select
              label="Role"
              placeholder="Select role"
              selectedKeys={[newUser.role]}
              onChange={(e: any) =>
                setNewUser({ ...newUser, role: e.target.value as Role })
              }
              isRequired
              variant="bordered"
            >
              <SelectItem key="teacher">Teacher</SelectItem>
              <SelectItem key="candidate">Candidate</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateUser}>
              Create User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
