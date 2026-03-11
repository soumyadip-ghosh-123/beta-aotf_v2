"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Switch } from "@heroui/switch";
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
  UserPlus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
  AlertTriangle,
  GripVertical,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RenownedTeacher {
  _id: string;
  name: string;
  designation: string;
  image: string;
  quote: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
}

type FormState = {
  name: string;
  designation: string;
  image: string;
  quote: string;
  order: string;
  isVisible: boolean;
};

const emptyForm: FormState = {
  name: "",
  designation: "",
  image: "",
  quote: "",
  order: "0",
  isVisible: true,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RenownedTeachersPage() {
  const [teachers, setTeachers] = useState<RenownedTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Add / Edit modal ──────────────────────────────────────────────────
  const { isOpen: isFormOpen, onOpen: openForm, onClose: closeForm } = useDisclosure();
  const [editTarget, setEditTarget] = useState<RenownedTeacher | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // ── Delete modal ──────────────────────────────────────────────────────
  const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<RenownedTeacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/v1/renowned-teachers?all=true", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTeachers(data.teachers ?? []);
    } catch {
      setFetchError("Could not load renowned teachers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // ── Add ───────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormErrors({});
    openForm();
  };

  // ── Edit ──────────────────────────────────────────────────────────────

  const openEdit = (teacher: RenownedTeacher) => {
    setEditTarget(teacher);
    setForm({
      name: teacher.name,
      designation: teacher.designation,
      image: teacher.image,
      quote: teacher.quote,
      order: String(teacher.order),
      isVisible: teacher.isVisible,
    });
    setFormErrors({});
    openForm();
  };

  // ── Validate ──────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    else if (form.name.trim().length < 2) errors.name = "At least 2 characters";
    if (!form.designation.trim()) errors.designation = "Designation is required";
    if (!form.image.trim()) errors.image = "Image URL is required";
    else {
      try {
        new URL(form.image.trim());
      } catch {
        errors.image = "Must be a valid URL";
      }
    }
    if (!form.quote.trim()) errors.quote = "Quote is required";
    else if (form.quote.trim().length < 5) errors.quote = "At least 5 characters";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Save (create or update) ───────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        designation: form.designation.trim(),
        image: form.image.trim(),
        quote: form.quote.trim(),
        order: Number(form.order) || 0,
        isVisible: form.isVisible,
      };

      if (editTarget) {
        const res = await fetch(`/api/v1/renowned-teachers/${editTarget._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const data = await res.json();
        setTeachers((prev) =>
          prev.map((t) => (t._id === editTarget._id ? data.teacher : t)),
        );
        addToast({ description: "Teacher updated successfully", color: "success" });
      } else {
        const res = await fetch("/api/v1/renowned-teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const data = await res.json();
        setTeachers((prev) =>
          [...prev, data.teacher].sort((a, b) => a.order - b.order),
        );
        addToast({ description: "Teacher added successfully", color: "success" });
      }
      closeForm();
    } catch {
      addToast({ description: "Failed to save. Please try again.", color: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toggle visibility ─────────────────────────────────────────────────

  const toggleVisibility = async (teacher: RenownedTeacher) => {
    try {
      const res = await fetch(`/api/v1/renowned-teachers/${teacher._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !teacher.isVisible }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTeachers((prev) =>
        prev.map((t) => (t._id === teacher._id ? data.teacher : t)),
      );
      addToast({
        description: `${teacher.name} is now ${!teacher.isVisible ? "visible" : "hidden"}`,
        color: "success",
      });
    } catch {
      addToast({ description: "Failed to update visibility", color: "danger" });
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────

  const handleDeleteClick = (teacher: RenownedTeacher) => {
    setDeleteTarget(teacher);
    openDelete();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/renowned-teachers/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setTeachers((prev) => prev.filter((t) => t._id !== deleteTarget._id));
      addToast({ description: `"${deleteTarget.name}" deleted`, color: "success" });
      closeDelete();
    } catch {
      addToast({ description: "Failed to delete", color: "danger" });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  const visibleCount = teachers.filter((t) => t.isVisible).length;

  return (
    <div className="container mx-auto px-4 max-w-5xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-default-900 flex items-center gap-2">
            <GraduationCap size={24} className="text-primary" />
            Renowned Teachers
          </h1>
          <p className="text-sm text-default-500 mt-0.5">
            Manage the teacher cards shown on the homepage.
          </p>
        </div>
        <Button
          variant="flat"
          size="sm"
          startContent={<RefreshCw size={14} />}
          onPress={fetchTeachers}
          isDisabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3 items-center">
        <Chip variant="flat" color="primary" startContent={<GraduationCap size={14} />}>
          {teachers.length} Total
        </Chip>
        <Chip variant="flat" color="success" startContent={<Eye size={14} />}>
          {visibleCount} Visible
        </Chip>
        {teachers.length - visibleCount > 0 && (
          <Chip variant="flat" color="default" startContent={<EyeOff size={14} />}>
            {teachers.length - visibleCount} Hidden
          </Chip>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : fetchError ? (
        <Card>
          <CardBody className="py-12 text-center">
            <AlertTriangle size={40} className="mx-auto text-danger mb-3" />
            <p className="text-default-500">{fetchError}</p>
            <Button size="sm" className="mt-4" onPress={fetchTeachers}>
              Retry
            </Button>
          </CardBody>
        </Card>
      ) : teachers.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <GraduationCap size={48} className="mx-auto text-default-300 mb-3" />
            <p className="text-default-500 mb-4">No renowned teachers yet.</p>
            <Button color="primary" startContent={<UserPlus size={16} />} onPress={openAdd}>
              Add First Teacher
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {teachers.map((teacher) => (
              <motion.div
                key={teacher._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <TeacherCard
                  teacher={teacher}
                  onEdit={openEdit}
                  onDelete={handleDeleteClick}
                  onToggleVisibility={toggleVisibility}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Floating Add Button ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <Tooltip content="Add Teacher" placement="left" color="primary">
          <Button
            color="primary"
            onPress={openAdd}
            isIconOnly
            radius="full"
            size="lg"
            className="shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all"
          >
            <UserPlus size={20} />
          </Button>
        </Tooltip>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal isOpen={isFormOpen} onClose={closeForm} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <GraduationCap size={20} className="text-primary" />
            {editTarget ? "Edit Teacher" : "Add Renowned Teacher"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Dr. Ananya Sharma"
              value={form.name}
              onValueChange={(v) => {
                setForm((p) => ({ ...p, name: v }));
                setFormErrors((e) => { const n = { ...e }; delete n.name; return n; });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!formErrors.name}
              errorMessage={formErrors.name}
            />
            <Input
              label="Designation"
              placeholder="e.g. Physics Faculty • IIT-JEE"
              value={form.designation}
              onValueChange={(v) => {
                setForm((p) => ({ ...p, designation: v }));
                setFormErrors((e) => { const n = { ...e }; delete n.designation; return n; });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!formErrors.designation}
              errorMessage={formErrors.designation}
            />
            <Input
              label="Photo URL"
              placeholder="https://example.com/photo.jpg"
              value={form.image}
              onValueChange={(v) => {
                setForm((p) => ({ ...p, image: v }));
                setFormErrors((e) => { const n = { ...e }; delete n.image; return n; });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!formErrors.image}
              errorMessage={formErrors.image}
              description="Paste a direct image URL (HTTPS recommended)"
            />
            {/* Image preview */}
            {form.image && !formErrors.image && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-default-50">
                <Avatar src={form.image} size="lg" radius="full" name={form.name || "?"} />
                <div>
                  <p className="text-sm font-medium">{form.name || "Preview"}</p>
                  <p className="text-xs text-default-500">{form.designation || "—"}</p>
                </div>
              </div>
            )}
            <Textarea
              label="Quote"
              placeholder="Their key teaching philosophy or inspiring quote…"
              value={form.quote}
              onValueChange={(v) => {
                setForm((p) => ({ ...p, quote: v }));
                setFormErrors((e) => { const n = { ...e }; delete n.quote; return n; });
              }}
              isRequired
              variant="bordered"
              isInvalid={!!formErrors.quote}
              errorMessage={formErrors.quote}
              minRows={2}
              maxRows={4}
              description={`${form.quote.length}/500`}
            />
            <div className="flex gap-3 items-center">
              <Input
                label="Display Order"
                placeholder="0"
                type="number"
                value={form.order}
                onValueChange={(v) => setForm((p) => ({ ...p, order: v }))}
                variant="bordered"
                className="max-w-30"
                startContent={<GripVertical size={16} className="text-default-400" />}
                description="Lower = shown first"
              />
              <div className="flex items-center gap-2 mt-4">
                <Switch
                  isSelected={form.isVisible}
                  onValueChange={(v) => setForm((p) => ({ ...p, isVisible: v }))}
                  size="sm"
                  color="success"
                />
                <span className="text-sm text-default-600">
                  {form.isVisible ? "Visible on homepage" : "Hidden from homepage"}
                </span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeForm} isDisabled={isSaving}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={isSaving}>
              {editTarget ? "Save Changes" : "Add Teacher"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal isOpen={isDeleteOpen} onClose={closeDelete}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-danger" />
            Delete Teacher
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Are you sure you want to permanently remove this teacher card from the homepage?
            </p>
            {deleteTarget && (
              <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-danger-50/40">
                <Avatar
                  src={deleteTarget.image}
                  size="md"
                  radius="full"
                  name={deleteTarget.name}
                />
                <div>
                  <p className="text-sm font-semibold">{deleteTarget.name}</p>
                  <p className="text-xs text-default-500">{deleteTarget.designation}</p>
                </div>
              </div>
            )}
            <p className="text-sm text-danger-500 mt-2">This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeDelete} isDisabled={isDeleting}>
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────

function TeacherCard({
  teacher,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  teacher: RenownedTeacher;
  onEdit: (t: RenownedTeacher) => void;
  onDelete: (t: RenownedTeacher) => void;
  onToggleVisibility: (t: RenownedTeacher) => void;
}) {
  return (
    <Card
      className={`border transition-all ${
        teacher.isVisible
          ? "border-divider/50 hover:shadow-md"
          : "border-divider/30 opacity-60 hover:opacity-80"
      }`}
    >
      <CardHeader className="pb-1">
        <div className="flex items-center gap-3 w-full">
          <Avatar src={teacher.image} name={teacher.name} size="md" radius="full" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-default-900 truncate">
                {teacher.name}
              </p>
              <Chip
                size="sm"
                color={teacher.isVisible ? "success" : "default"}
                variant="dot"
                classNames={{ content: "text-xs" }}
              >
                {teacher.isVisible ? "Visible" : "Hidden"}
              </Chip>
            </div>
            <p className="text-xs text-default-500 truncate">{teacher.designation}</p>
          </div>
          <Chip size="sm" variant="flat" color="default" classNames={{ content: "text-xs font-mono" }}>
            #{teacher.order}
          </Chip>
        </div>
      </CardHeader>
      <CardBody className="pt-1 pb-2">
        <p className="text-sm italic text-default-600 leading-relaxed line-clamp-2">
          "{teacher.quote}"
        </p>
      </CardBody>
      <CardFooter className="gap-2 pt-0">
        <Tooltip
          content={teacher.isVisible ? "Hide from homepage" : "Show on homepage"}
          color={teacher.isVisible ? "default" : "success"}
        >
          <Button
            size="sm"
            variant="flat"
            color={teacher.isVisible ? "default" : "success"}
            isIconOnly
            onPress={() => onToggleVisibility(teacher)}
          >
            {teacher.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
        </Tooltip>
        <Button
          size="sm"
          variant="flat"
          color="primary"
          startContent={<Pencil size={14} />}
          onPress={() => onEdit(teacher)}
          className="flex-1"
        >
          Edit
        </Button>
        <Tooltip content="Delete teacher" color="danger">
          <Button
            size="sm"
            variant="flat"
            color="danger"
            isIconOnly
            onPress={() => onDelete(teacher)}
          >
            <Trash2 size={14} />
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}
