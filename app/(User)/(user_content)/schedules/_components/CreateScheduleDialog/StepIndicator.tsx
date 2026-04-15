"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    number: number;
    icon?: React.ReactElement;
    label: string;
    sublabel: string;
}

interface StepIndicatorProps {
    currentStep: number;
    steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <div className="flex items-center justify-between mb-4 md:mb-8 px-0 md:px-4">
            {steps.map((step, index) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={step.number}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center gap-1.5 md:gap-2">
                            <div
                                className={cn(
                                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm transition-all shadow-sm",
                                    isCompleted && "bg-green-500 text-white",
                                    isActive && "bg-bgBlue text-white",
                                    !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                                ) : step.icon ? (
                                    <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                                        {step.icon}
                                    </div>
                                ) : (
                                    <span>{step.number}</span>
                                )}
                            </div>
                            <div className="text-center hidden sm:block">
                                <p className={cn(
                                    "text-[10px] md:text-xs font-medium",
                                    isActive ? "text-bgBlue" : "text-muted"
                                )}>
                                    Step {step.number}
                                </p>
                                <p className={cn(
                                    "text-[10px] md:text-xs whitespace-nowrap",
                                    isActive ? "text-headings font-medium" : "text-muted"
                                )}>
                                    {step.label}
                                </p>
                                <p className="text-[10px] text-muted hidden lg:block">{step.sublabel}</p>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {!isLast && (
                            <div
                                className={cn(
                                    "flex-1 h-[2px] mx-2 transition-all",
                                    isCompleted ? "bg-green-500" : "bg-gray-200"
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StepIndicator;
