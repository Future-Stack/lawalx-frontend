/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, Square } from "lucide-react";

interface QrScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
}

export default function QrScanner({
    isOpen,
    onClose,
    onScanSuccess,
}: QrScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string>("");
    const [isLaunching, setIsLaunching] = useState(false);

    const startScanner = async () => {
        // Check for secure context
        if (typeof window !== "undefined" && !window.isSecureContext) {
            setError("Camera requires a secure connection (HTTPS or localhost).");
            return;
        }

        const readerElement = document.getElementById("reader");
        if (!readerElement) {
            console.error("Reader element not found");
            return;
        }

        try {
            setIsLaunching(true);
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }

            const qrCode = scannerRef.current;

            // If already scanning, don't start again
            if (scanning) {
                setIsLaunching(false);
                return;
            }

            await qrCode.start(
                { facingMode: "environment" },
                {
                    fps: 20,
                    qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const qrboxSize = Math.floor(minEdge * 0.7);
                        return { width: qrboxSize, height: qrboxSize };
                    },
                    aspectRatio: 1.0,
                },
                async (decodedText) => {
                    console.log("Scan Success:", decodedText);
                    try {
                        const qrCode = scannerRef.current;
                        if (qrCode) {
                            await qrCode.stop();
                            setScanning(false);
                        }
                    } catch (e) {
                        console.error("Failed to stop after scan", e);
                    }
                    onScanSuccess(decodedText);
                    setResult(decodedText);
                },
                (errorMessage) => {
                    // Silent frame-by-frame errors
                }
            );

            setScanning(true);
            setError(null);
            setIsLaunching(false);
        } catch (err: any) {
            console.error("Camera start failed", err);
            setIsLaunching(false);

            if (err?.toString().includes("NotAllowedError") || err?.name === "NotAllowedError") {
                setError("Camera permission denied. Please click the lock icon in your browser's address bar to reset permissions.");
            } else if (err?.toString().includes("NotFoundError") || err?.name === "NotFoundError") {
                setError("No camera found on this device.");
            } else {
                setError("Unable to access camera. Please check permissions and connection.");
            }

            setScanning(false);
        }
    };

    const stopScanner = async () => {
        try {
            if (scannerRef.current && scanning) {
                await scannerRef.current.stop();
                setScanning(false);
            }
        } catch (err) {
            console.error("Stop failed", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Small initial delay to ensure DOM is ready
            const timer = setTimeout(() => {
                startScanner();
            }, 100);
            return () => {
                clearTimeout(timer);
                stopScanner();
            };
        }
        return () => stopScanner();
    }, [isOpen]);

    const handleClose = async () => {
        await stopScanner();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer" onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className="bg-white dark:bg-gray-950 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10 cursor-default" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-white dark:bg-gray-900 px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-gray-900 dark:text-white font-semibold">QR Scanner</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Automatic Detection</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center">
                    <div className="relative w-full aspect-square max-w-[300px] mb-6 rounded-xl overflow-hidden shadow-inner bg-black">
                        {(scanning || isLaunching) && (
                            <div className="absolute inset-0 z-20 pointer-events-none">
                                {/* Modern subtle scan animation */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-line" />

                                {/* Corner Accents */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px]">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                                </div>
                            </div>
                        )}

                        {!scanning && !error && !isLaunching && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                                <Camera className="w-10 h-10 opacity-20" />
                                <p className="text-sm font-medium">Camera Stopped</p>
                            </div>
                        )}

                        {isLaunching && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 text-white bg-black/60 backdrop-blur-[2px]">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm font-medium">Launching Camera...</p>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-red-50 dark:bg-red-950/20">
                                <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-4">{error}</p>
                                <button
                                    onClick={startScanner}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
                                >
                                    Retry Access
                                </button>
                            </div>
                        )}

                        <div id="reader" className="w-full h-full relative z-10 [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-center gap-3">
                            {!scanning ? (
                                <button
                                    onClick={startScanner}
                                    disabled={isLaunching}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Camera className="w-4 h-4" />
                                    {isLaunching ? "Launching..." : "Start Scanning"}
                                </button>
                            ) : (
                                <button
                                    onClick={stopScanner}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold transition-all shadow-lg active:scale-95 cursor-pointer"
                                >
                                    <Square className="w-4 h-4" />
                                    Stop Scanner
                                </button>
                            )}
                        </div>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 px-4">
                            Position the QR code within the frame to automatically detect it
                        </p>
                    </div>
                </div>

            </div>
            <style jsx>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
        #reader {
          background-color: black !important;
          border: none !important;
          width: 100% !important;
          height: 100% !important;
        }
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #reader__status_span {
          display: none !important;
        }
        #reader__dashboard {
          display: none !important;
        }
        #reader img {
          display: none !important;
        }
      `}</style>
        </div>
    );
}
