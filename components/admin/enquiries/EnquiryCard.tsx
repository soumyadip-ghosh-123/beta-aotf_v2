"use client";

import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import {
  User,
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  RotateCcw,
  Icon,
  PhoneCall,
  TrendingUp,
} from "lucide-react";
import { FaPhone } from "react-icons/fa";
import { IoConstruct } from "react-icons/io5";
import { Link } from "@heroui/link";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";

export type Enquiry = {
  enquiryId: string;
  name: string;
  phone: string;
  query: string;
  currentStatus: "new" | "in-progress" | "resolved";
  lastActionByAdmin?: string;
  adminRole?: "super admin" | "support admin";
  resolvedAt?: string;
  lastActionAt?: string;
  createdAt: string;
  updatedAt: string;
};

type EnquiryCardProps = {
  enquiry: Enquiry;
};

export default function EnquiryCard({ enquiry }: EnquiryCardProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="bottom-center"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                Status
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={16} />
                    <p className="text-sm text-default-600">
                      Current Status:{" "}
                      <Chip color="primary">
                        {enquiry.currentStatus.toUpperCase()}
                      </Chip>
                    </p>
                  </div>
                  <MetaRow
                    icon={<Clock size={16} />}
                    label="Last Action At"
                    value={formatDate(enquiry.lastActionAt)}
                  />
                </div>

                {/* Select options with this options "new","in_progress","contacted","unreachable","resolved","closed"*/}
                <Select
                  isRequired
                  defaultSelectedKeys={["cat"]}
                  label="Update Status"
                  placeholder="Select status"
                  labelPlacement="outside-left"
                >
                  <SelectItem key="new">New</SelectItem>
                  <SelectItem key="in_progress">In Progress</SelectItem>
                  <SelectItem key="contacted">Contacted</SelectItem>
                  <SelectItem key="unreachable">Unreachable</SelectItem>
                  <SelectItem key="resolved">Resolved</SelectItem>
                  <SelectItem key="closed">Closed</SelectItem>
                </Select>

                <Textarea
                  label="Add Notes"
                  placeholder="Add any notes regarding this status update"
                  minRows={4}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Update
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Card className="w-full hover:shadow-lg transition-shadow">
        {/* Header */}
        <CardHeader className="flex items-start justify-between gap-3">
          <div className=" flex flex-col items-start">
            <p className="text-xs text-default-500">Enquiry ID</p>
            <p className="font-semibold tracking-wide">{enquiry.enquiryId}</p>
            <p className="text-xs text-default-500">
              {formatDate(enquiry.createdAt)}
            </p>
          </div>

          <StatusChip status={enquiry.currentStatus} />
        </CardHeader>

        {/* Body */}
        <CardBody className="space-y-5">
          {/* User Info */}
          <Section
            icon={<User size={18} />}
            title="Name"
            subTitle="Phone Number"
            value={enquiry.name}
            subValue={enquiry.phone}
            subIcon={<Phone size={16} />}
          />

          {/* Query */}
          <Section
            icon={<MessageSquare size={18} />}
            title="Query"
            value={enquiry.query}
            multiline
          />

          {/* Meta */}
          <div className="border-t pt-4 space-y-3">
            <MetaRow
              icon={<ShieldCheck size={16} />}
              label="Last Action By"
              value={
                enquiry.lastActionByAdmin
                  ? `${enquiry.lastActionByAdmin} ${enquiry.adminRole ? `(${enquiry.adminRole})` : ""}`
                  : "-"
              }
            />
            <MetaRow
              icon={<Clock size={16} />}
              label="Last Action At"
              value={formatDate(enquiry.lastActionAt)}
            />
            <MetaRow
              icon={<RotateCcw size={16} />}
              label="Attempt number"
              value={"2"}
            />
          </div>
        </CardBody>
        <CardFooter className="grid grid-cols-3 gap-2 justify-end">
          {/* Action buttons can go here */}
          <Button color="secondary">Cancel</Button>
          <Button color="secondary" onPress={onOpen}>
            open
          </Button>
          <Button color="primary">
            <FaPhone /> Call
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

const EnquiryModal = () => {
  return <div></div>;
};

/* ---------- Sub Components ---------- */

function StatusChip({ status }: { status: Enquiry["currentStatus"] }) {
  const config = {
    new: { color: "primary", label: "NEW" },
    "in-progress": { color: "warning", label: "IN PROGRESS" },
    resolved: { color: "success", label: "RESOLVED" },
  } as const;

  return (
    <Chip color={config[status].color} variant="flat" size="sm">
      {config[status].label}
    </Chip>
  );
}

function Section({
  icon,
  title,
  subTitle,
  value,
  subValue,
  subIcon,
  multiline,
}: {
  icon: React.ReactNode;
  title: string;
  subTitle?: string;
  value: string;
  subValue?: string;
  subIcon?: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className={`grid ${subValue && "grid-cols-2"} gap-3`}>
      <div className="flex gap-3 items-start">
        <div className="text-primary">{icon}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium">{title}</p>
          </div>
          <p
            className={`text-sm text-default-600 ${
              multiline ? "leading-relaxed" : ""
            }`}
          >
            {value}
          </p>
        </div>
      </div>
      <div className="flex gap-2 items-start">
        {subValue && (
          <div className="flex gap-3 items-start">
            <div className="text-primary">{subIcon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">{subTitle}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-default-500">
                <span>{subValue}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-default-500">
      {icon}
      <span className="w-32">{label}</span>
      <span className="text-default-700">{value}</span>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}
