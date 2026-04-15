"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Select, SelectItem } from "@heroui/select";

export function UserSelect() {
  const { users, selectedUserId, setSelectedUserId } = useCalendar();

  const safeUsers = users ?? [];

  return (
    <Select
      className="flex-1 md:w-48"
      placeholder="Select user"
      selectedKeys={selectedUserId ? [selectedUserId] : []}
      onSelectionChange={(keys) => {
        const value = Array.from(keys)[0] as string;
        setSelectedUserId(value);
      }}
    >
      {[
        // ✅ ALL USERS OPTION
        <SelectItem key="all" textValue="All users">
          <div className="flex items-center gap-1">All</div>
        </SelectItem>,

        // ✅ USER LIST
        ...safeUsers.map((user) => (
          <SelectItem key={user.id} textValue={user.name ?? "Unnamed User"}>
            <div className="flex items-center gap-2">
              <Avatar
                src={user.picturePath ?? undefined}
                name={user.name ?? "User"}
                className="w-6 h-6 text-tiny"
              />

              <p className="truncate">{user.name ?? "Unnamed User"}</p>
            </div>
          </SelectItem>
        )),
      ]}
    </Select>
  );
}
