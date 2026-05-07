"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

interface QRCodeDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const QRCodeDialog = ({ open, setOpen }: QRCodeDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[400px] p-0 gap-0 rounded-2xl overflow-hidden border-none bg-navbarBg shadow-lg">
                <DialogHeader className="p-6 pb-2 text-center">
                    <DialogTitle className="text-2xl font-bold text-headings">
                        Scan QR Code
                    </DialogTitle>
                    <DialogDescription className="text-base text-body mt-1">
                        Scan this QR code to connect your device.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-8 pb-10 space-y-6">
                    <div className="bg-navbarBg p-4 rounded-xl border-2 border-dashed border-gray-300" >
                        <Image
                            src="/images/qr.png"
                            alt="QR Code"
                            width={200}
                            height={200}
                            className="w-48 h-48 object-contain"
                        />
                    </div>

                    <p className="text-sm text-center text-textGray max-w-[250px]">
                        Point your device&apos;s camera at the QR code above to instantly pair it.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QRCodeDialog;
