'use client';

import { useEffect } from "react";
import { Modal, ModalBody, ModalContent, useDisclosure } from "@heroui/modal";
import InlineAdCard from "@/components/InlineAdCard";

type InlineAd = {
  adId: string;
  title: string;
  adType: "image" | "text" | "html";
  placement: string;
  imageUrl?: string;
  content?: string;
  targetUrl?: string;
  advertiser: string;
};

export default function PopupAdModal({ ad }: { ad: InlineAd }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const storageKey = `popup-ad-seen-${ad.adId}`;
    if (window.localStorage.getItem(storageKey)) {
      return;
    }

    window.localStorage.setItem(storageKey, "1");
    onOpen();
  }, [ad.adId, onOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" placement="center">
      <ModalContent>
        <ModalBody className="p-4">
          <InlineAdCard ad={ad} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}