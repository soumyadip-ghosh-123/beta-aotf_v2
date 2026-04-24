"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { cloneElement, isValidElement } from "react";
import type { ReactElement } from "react";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { Select, SelectItem } from "@heroui/select";

import { CalendarDate, Time } from "@internationalized/date";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { Avatar } from "@heroui/avatar";

import { eventSchema } from "@/calendar/schemas";
import type { TEventFormData } from "@/calendar/schemas";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { users } = useCalendar();
  type DatePickerValue = React.ComponentProps<typeof DatePicker>["value"];

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate,
      startTime,
    },
  });

  const onSubmit = (_values: TEventFormData) => {
    onClose();
    form.reset();
  };

  useEffect(() => {
    form.reset({ startDate, startTime });
  }, [startDate, startTime, form]);
  const { isOpen, onClose, onToggle } = useDisclosure();

  type TriggerProps = {
    onPress?: () => void;
  };

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<TriggerProps>, {
        onPress: onToggle,
      })
    : children;
  return (
    <>
      {trigger}

      <Modal isOpen={isOpen} onOpenChange={onToggle} placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Event</ModalHeader>

              <ModalBody>
                <p className="text-sm text-warning flex items-center gap-1">
                  <AlertTriangle className="size-4" />
                  Demo only — no backend call.
                </p>

                <form
                  id="event-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-4 py-4"
                >
                  {/* USER */}
                  <Select
                    label="Responsible"
                    selectedKeys={
                      form.watch("user") ? [form.watch("user")] : []
                    }
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      form.setValue("user", value);
                    }}
                    isInvalid={!!form.formState.errors.user}
                    errorMessage={form.formState.errors.user?.message}
                  >
                    {users.map((user) => (
                      <SelectItem key={user.id} textValue={user.name ?? "User"}>
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={user.picturePath ?? undefined}
                            name={user.name ?? "User"}
                            className="size-6"
                          />
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </Select>

                  {/* TITLE */}
                  <Input
                    label="Title"
                    placeholder="Enter a title"
                    {...form.register("title")}
                    isInvalid={!!form.formState.errors.title}
                    errorMessage={form.formState.errors.title?.message}
                  />

                  {/* START DATE */}
                  <DatePicker
                    label="Start date"
                    value={
                      form.watch("startDate")
                        ? new CalendarDate(
                            form.watch("startDate").getFullYear(),
                            form.watch("startDate").getMonth() + 1,
                            form.watch("startDate").getDate(),
                          ) as unknown as DatePickerValue
                        : null
                    }
                    onChange={(val) => {
                      if (!val) return;
                      const date = val as CalendarDate;
                      form.setValue(
                        "startDate",
                        new Date(date.year, date.month - 1, date.day),
                      );
                    }}
                    isInvalid={!!form.formState.errors.startDate}
                    errorMessage={form.formState.errors.startDate?.message}
                  />

                  {/* START TIME */}
                  <Input
                    label="Start time"
                    type="time"
                    value={
                      form.watch("startTime")
                        ? `${String(form.watch("startTime").hour).padStart(2, "0")}:${String(
                            form.watch("startTime").minute,
                          ).padStart(2, "0")}`
                        : ""
                    }
                    onChange={(e) => {
                      const [hour, minute] = e.target.value
                        .split(":")
                        .map(Number);
                      form.setValue("startTime", { hour, minute });
                    }}
                    isInvalid={!!form.formState.errors.startTime}
                    errorMessage={form.formState.errors.startTime?.message}
                  />

                  {/* END DATE */}
                  <DatePicker
                    label="End date"
                    value={
                      form.watch("endDate")
                        ? new CalendarDate(
                            form.watch("endDate").getFullYear(),
                            form.watch("endDate").getMonth() + 1,
                            form.watch("endDate").getDate(),
                          ) as unknown as DatePickerValue
                        : null
                    }
                    onChange={(val) => {
                      if (!val) return;
                      const date = val as CalendarDate;
                      form.setValue(
                        "endDate",
                        new Date(date.year, date.month - 1, date.day),
                      );
                    }}
                    isInvalid={!!form.formState.errors.endDate}
                    errorMessage={form.formState.errors.endDate?.message}
                  />

                  {/* END TIME */}
                  <Input
                    label="End time"
                    type="time"
                    value={
                      form.watch("endTime")
                        ? `${String(form.watch("endTime").hour).padStart(2, "0")}:${String(
                            form.watch("endTime").minute,
                          ).padStart(2, "0")}`
                        : ""
                    }
                    onChange={(e) => {
                      const [hour, minute] = e.target.value
                        .split(":")
                        .map(Number);
                      form.setValue("endTime", { hour, minute });
                    }}
                    isInvalid={!!form.formState.errors.endTime}
                    errorMessage={form.formState.errors.endTime?.message}
                  />

                  {/* COLOR */}
                  <Select
                    label="Color"
                    selectedKeys={
                      form.watch("color") ? [form.watch("color")] : []
                    }
                    onSelectionChange={(keys) => {
                      const value = Array.from(
                        keys,
                      )[0] as TEventFormData["color"];
                      form.setValue("color", value);
                    }}
                    isInvalid={!!form.formState.errors.color}
                    errorMessage={form.formState.errors.color?.message}
                  >
                    {[
                      "blue",
                      "green",
                      "red",
                      "yellow",
                      "purple",
                      "orange",
                      "gray",
                    ].map((c) => (
                      <SelectItem key={c}>{c}</SelectItem>
                    ))}
                  </Select>

                  {/* DESCRIPTION */}
                  <Textarea
                    label="Description"
                    {...form.register("description")}
                    isInvalid={!!form.formState.errors.description}
                    errorMessage={form.formState.errors.description?.message}
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button form="event-form" type="submit">
                  Create Event
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
