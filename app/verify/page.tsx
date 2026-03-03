"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import BackButton from "@/components/BackButton";
import { siteConfig } from "@/config/site";
import {
  Camera,
  CameraOff,
  Search,
  ScanLine,
  ShieldCheck,
  FlipHorizontal2,
  Keyboard,
  AlertTriangle,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract AOTF ID from a scanned string (could be full URL or plain ID) */
function extractId(raw: string): string | null {
  const trimmed = raw.trim();

  // Full URL: https://aotf.in/verify/AOTF-T-2024-0042
  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    // look for /verify/<id>
    const verifyIdx = segments.indexOf("verify");
    if (verifyIdx !== -1 && segments[verifyIdx + 1]) {
      return decodeURIComponent(segments[verifyIdx + 1]);
    }
  } catch {
    // Not a URL — continue
  }

  // Plain AOTF ID pattern: AOTF-T-2024-0042 or AOTF-C-2025-0118
  if (/^AOTF-[TC]-\d{4}-\d{4,}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Any non-empty string — let the verify/[id] page handle it
  if (trimmed.length > 0) {
    return trimmed;
  }

  return null;
}

// ─── Scanner states ───────────────────────────────────────────────────────────

type ScannerState =
  | "idle"        // camera not started
  | "starting"    // requesting permission
  | "scanning"    // camera active
  | "scanned"     // got a result, navigating
  | "error";      // camera error

// ─── Page component ───────────────────────────────────────────────────────────

export default function VerifyScannerPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scannerState, setScannerState] = useState<ScannerState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [manualId, setManualId] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch {
      // ignore
    }
    try {
      scannerRef.current?.clear();
    } catch {
      // ignore
    }
    scannerRef.current = null;
  }, []);
  const startScanner = useCallback(async () => {
    // Clean up existing scanner first
    await stopScanner();

    setScannerState("starting");
    setErrorMsg("");
    setScannedId(null);

    const qrConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    };

    const onSuccess = (decodedText: string) => {
      const id = extractId(decodedText);
      if (id) {
        setScannedId(id);
        setScannerState("scanned");
        scannerRef.current?.stop().catch(() => {});
        setTimeout(() => {
          router.push(`/verify/${encodeURIComponent(id)}`);
        }, 800);
      }
    };

    const onFailure = () => {
      // Called every frame that doesn't decode — ignore
    };    try {
      // Step 1: Explicitly request camera permission via getUserMedia
      // This triggers the browser's allow/deny popup on first visit.
      // Without this, enumerateDevices() / getCameras() may silently fail
      // or return empty labels without ever showing the permission prompt.
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (permErr: unknown) {
        // Permission denied or no camera — handle below
        const permMsg =
          permErr instanceof DOMException
            ? permErr.name
            : permErr instanceof Error
              ? permErr.message
              : String(permErr);

        if (
          permMsg.includes("NotAllowedError") ||
          permMsg.includes("Permission") ||
          permMsg.includes("denied")
        ) {
          setScannerState("error");
          setErrorMsg(
            "Camera permission denied. Please allow camera access in your browser settings and try again."
          );
          return;
        }
        if (
          permMsg.includes("NotFoundError") ||
          permMsg.includes("Requested device not found")
        ) {
          setScannerState("error");
          setErrorMsg(
            "No camera found on this device. Use the manual input below to verify an ID."
          );
          return;
        }
        if (permMsg.includes("NotReadableError") || permMsg.includes("in use")) {
          setScannerState("error");
          setErrorMsg(
            "Camera is in use by another application. Close other apps using the camera and try again."
          );
          return;
        }
        // Unknown getUserMedia error — fall through and try anyway
      } finally {
        // Stop the temporary stream so html5-qrcode can claim the camera
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
      }

      // Step 2: Now enumerate cameras (labels will be populated after permission grant)
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        setScannerState("error");
        setErrorMsg(
          "No camera found on this device. Use the manual input below to verify an ID."
        );
        return;
      }

      const html5Qr = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qr;

      // Prefer back camera; fall back to first available
      const backCam = cameras.find(
        (c) =>
          c.label.toLowerCase().includes("back") ||
          c.label.toLowerCase().includes("rear") ||
          c.label.toLowerCase().includes("environment")
      );
      const frontCam = cameras.find(
        (c) =>
          c.label.toLowerCase().includes("front") ||
          c.label.toLowerCase().includes("user")
      );

      const preferred =
        facingMode === "environment"
          ? backCam ?? cameras[cameras.length - 1]  // last is usually back cam
          : frontCam ?? cameras[0];

      try {
        // Try with specific device ID first (most reliable)
        await html5Qr.start(
          preferred.id,
          qrConfig,
          onSuccess,
          onFailure
        );
      } catch {
        // Fallback: try with facingMode constraint
        try {
          await html5Qr.start(
            { facingMode },
            qrConfig,
            onSuccess,
            onFailure
          );
        } catch {
          // Last resort: try first camera by ID
          await html5Qr.start(
            cameras[0].id,
            qrConfig,
            onSuccess,
            onFailure
          );
        }
      }

      setScannerState("scanning");
    } catch (err: unknown) {
      setScannerState("error");
      // html5-qrcode can throw plain strings, Error objects, or DOMException
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Could not access camera. Please check permissions and try again.";

      if (
        msg.includes("NotAllowedError") ||
        msg.includes("Permission") ||
        msg.includes("denied")
      ) {
        setErrorMsg(
          "Camera permission denied. Please allow camera access in your browser settings and try again."
        );
      } else if (
        msg.includes("NotFoundError") ||
        msg.includes("Requested device not found") ||
        msg.includes("no camera")
      ) {
        setErrorMsg(
          "No camera found on this device. Use the manual input below to verify an ID."
        );
      } else if (msg.includes("NotReadableError") || msg.includes("in use")) {
        setErrorMsg(
          "Camera is in use by another application. Close other apps using the camera and try again."
        );
      } else {
        setErrorMsg(msg);
      }
    }
  }, [facingMode, router, stopScanner]);
  const flipCamera = useCallback(async () => {
    setFacingMode((prev) => {
      const next = prev === "environment" ? "user" : "environment";
      // Stop current scanner and restart after state update
      stopScanner().then(() => {
        // Delay to allow state update + DOM settle
        setTimeout(() => {
          startScanner();
        }, 400);
      });
      return next;
    });
  }, [stopScanner, startScanner]);

  const handleManualSubmit = () => {
    const id = extractId(manualId);
    if (id) {
      router.push(`/verify/${encodeURIComponent(id)}`);
    }
  };

  return (
    <div className="w-full min-h-[70vh]">
      <BackButton title="Verify ID" />

      <div className="max-w-md mx-auto px-2 pb-8">
        {/* ── Header ── */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
            <ScanLine size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-default-900">
            Scan &amp; Verify
          </h1>
          <p className="text-sm text-default-500 mt-1">
            Scan the QR code on any {siteConfig.shortName} ID card to verify
            its authenticity
          </p>
        </div>        {/* ── Scanner Card ── */}
        <Card className="overflow-hidden mb-4">
          {/* Scanner viewport */}
          <div className="relative bg-black" style={{ minHeight: 300 }}>
            <div
              id="qr-reader"
              ref={containerRef}
              className="w-full"
            />

            {/* ── Idle overlay ── */}
            {scannerState === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <Camera size={36} className="text-white/60" />
                </div>
                <p className="text-white/60 text-sm text-center px-8">
                  Tap the button below to open your camera and scan a QR code
                </p>
              </div>
            )}

            {/* ── Starting overlay ── */}
            {scannerState === "starting" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900">
                <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-white/60 text-sm">Accessing camera…</p>
              </div>
            )}

            {/* ── Scanned overlay ── */}
            {scannerState === "scanned" && scannedId && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/90 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-green-400" />
                </div>
                <p className="text-white font-semibold text-sm">QR Code Detected!</p>
                <Chip variant="bordered" className="font-mono text-xs text-white border-white/30">
                  {scannedId}
                </Chip>
                <p className="text-white/50 text-xs">Redirecting to verification…</p>
              </div>
            )}            {/* ── Error overlay ── */}
            {scannerState === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900 px-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <CameraOff size={28} className="text-red-400" />
                </div>
                <p className="text-white/80 font-semibold text-sm text-center">
                  Camera Unavailable
                </p>
                <p className="text-white/50 text-xs text-center leading-relaxed">
                  {errorMsg}
                </p>
                <p className="text-white/30 text-[10px] text-center leading-relaxed mt-1">
                  Tip: Click the 🔒 icon in your address bar → Site settings → Camera → Allow, then retry.
                </p>
              </div>
            )}

            {/* ── Scanning corner brackets (visual guide) ── */}
            {scannerState === "scanning" && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-60 h-60">
                  {/* Top-left */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-green-400 rounded-tl-lg" />
                  {/* Top-right */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-green-400 rounded-tr-lg" />
                  {/* Bottom-left */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-green-400 rounded-bl-lg" />
                  {/* Bottom-right */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-green-400 rounded-br-lg" />
                  {/* Scan line animation */}
                  <div className="absolute left-2 right-2 h-0.5 bg-green-400/60 animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <CardBody className="p-3 space-y-2">
            <div className="flex gap-2">
              {(scannerState === "idle" || scannerState === "error") && (
                <Button
                  color="primary"
                  className="flex-1"
                  startContent={<Camera size={16} />}
                  onPress={startScanner}
                >
                  Start Camera
                </Button>
              )}

              {scannerState === "scanning" && (
                <>
                  <Button
                    color="danger"
                    variant="flat"
                    className="flex-1"
                    startContent={<CameraOff size={16} />}
                    onPress={async () => {
                      await stopScanner();
                      setScannerState("idle");
                    }}
                  >
                    Stop
                  </Button>
                  <Button
                    variant="flat"
                    isIconOnly
                    onPress={flipCamera}
                    aria-label="Flip camera"
                  >
                    <FlipHorizontal2 size={18} />
                  </Button>
                </>
              )}

              {scannerState === "starting" && (
                <Button color="primary" className="flex-1" isLoading>
                  Starting…
                </Button>
              )}
            </div>

            {/* Scanning status */}
            {scannerState === "scanning" && (
              <div className="flex items-center justify-center gap-2 py-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-default-500">
                  Point your camera at a QR code on an AOTF ID card
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 my-4">
          <Divider className="flex-1" />
          <span className="text-xs text-default-400 uppercase font-medium">
            or
          </span>
          <Divider className="flex-1" />
        </div>

        {/* ── Manual Input ── */}
        <Card className="overflow-hidden">
          <CardBody className="p-4 space-y-3">
            <button
              onClick={() => setShowManual(!showManual)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Keyboard size={16} className="text-default-400" />
                <span className="text-sm font-medium text-default-700">
                  Enter ID Manually
                </span>
              </div>
              <span className="text-xs text-default-400">
                {showManual ? "Hide" : "Show"}
              </span>
            </button>

            {showManual && (
              <div className="space-y-3 pt-1">
                <Input
                  value={manualId}
                  onValueChange={setManualId}
                  placeholder="e.g. AOTF-T-2024-0042"
                  variant="bordered"
                  size="sm"
                  classNames={{
                    input: "font-mono tracking-wider",
                  }}
                  startContent={
                    <Search size={14} className="text-default-400" />
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleManualSubmit();
                  }}
                />
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="w-full"
                  isDisabled={!manualId.trim()}
                  onPress={handleManualSubmit}
                  startContent={<ShieldCheck size={14} />}
                >
                  Verify ID
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Tips ── */}
        <Card className="mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <CardBody className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Tips for scanning
              </p>
            </div>
            <ul className="text-[11px] text-amber-600 dark:text-amber-400/80 space-y-1 pl-5 list-disc">
              <li>Hold your phone steady about 15–20 cm from the QR code</li>
              <li>Ensure the QR code is well-lit and not blurry</li>
              <li>The QR code is located at the bottom of every AOTF ID card</li>
              <li>If scanning fails, use the manual input above</li>
            </ul>
          </CardBody>
        </Card>

        {/* ── Footer ── */}
        <p className="text-center text-[10px] text-default-400 mt-6 leading-relaxed">
          {siteConfig.name} — Official Verification Portal
          <br />
          Contact us at{" "}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="underline"
          >
            {siteConfig.contact.email}
          </a>
        </p>
      </div>

      {/* ── Scan line animation keyframe ── */}
      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            top: 10%;
          }
          50% {
            top: 88%;
          }
        }
      `}</style>
    </div>
  );
}
