"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";
import { cloneElement, isValidElement, ReactElement } from "react";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { EditEventDialog } from "@/calendar/components/dialogs/edit-event-dialog";
import { useDisclosure } from "@/hooks/use-disclosure";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const { isOpen, onToggle, onClose } = useDisclosure();

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  // ✅ FIXED TRIGGER (same pattern)
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        onClick: (e: any) => {
          (children as ReactElement<any>).props?.onClick?.(e);
          onToggle();
        },
        onPress: (e: any) => {
          (children as ReactElement<any>).props?.onPress?.(e);
          onToggle();
        },
      })
    : children;

  return (
    <>
      {trigger}

      <Modal isOpen={isOpen} onOpenChange={onToggle} placement={"center"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{event.title}</ModalHeader>

              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <User className="mt-1 size-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Responsible</p>
                      <p className="text-sm text-muted-foreground">
                        {event.user.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="mt-1 size-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(startDate, "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="mt-1 size-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(endDate, "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Text className="mt-1 size-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Close
                </Button>

                <EditEventDialog event={event}>
                  <Button color="primary">Edit</Button>
                </EditEventDialog>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
