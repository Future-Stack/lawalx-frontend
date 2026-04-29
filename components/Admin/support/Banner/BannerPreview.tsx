'use client';

import React, { useState } from 'react';
import { 
  Monitor, Smartphone, ExternalLink, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, 
  Plus, Minus, Check, X, Search, Settings, User, Mail, Bell, Calendar, Clock, Home, Info, HelpCircle, 
  Star, Heart, ThumbsUp, ThumbsDown, Eye, EyeOff, Lock, Unlock, Trash, Edit, Link, Download, Upload, 
  Share, Copy, Play, Pause, Square, Circle, Zap, Gift, ShoppingBag, ShoppingCart, CreditCard, 
  DollarSign, Percent, Tag, Bookmark, Menu, Filter, Grid, List, LogOut, LogIn, RefreshCw
} from 'lucide-react';
import { BannerFormData } from './BannerForm';
import Image from 'next/image';

import { toast } from 'sonner';

interface BannerPreviewProps {
  data: BannerFormData;
}

export default function BannerPreview({ data }: BannerPreviewProps) {
  const [viewMode, setViewMode] = useState<'web' | 'mobile'>('web');

  const IconMap: any = {
    ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, 
    Plus, Minus, Check, X, Search, Settings, User, Mail, Bell, Calendar, Clock, Home, Info, HelpCircle, 
    Star, Heart, ThumbsUp, ThumbsDown, Eye, EyeOff, Lock, Unlock, Trash, Edit, 
    ExternalLink, Link, Download, Upload, Share, Copy, Play, Pause, Square, Circle, 
    Zap, Gift, ShoppingBag, ShoppingCart, CreditCard, DollarSign, Percent, Tag, Bookmark, 
    Menu, Filter, Grid, List, LogOut, LogIn, RefreshCw
  };

  const PrimaryIcon = (data.primaryButtonIcon && data.primaryButtonIcon !== 'none') ? IconMap[data.primaryButtonIcon] : ArrowRight;
  const SecondaryIcon = (data.secondaryButtonIcon && data.secondaryButtonIcon !== 'none') ? IconMap[data.secondaryButtonIcon] : null;

  const handleButtonClick = (url?: string) => {
    if (url && url !== '#' && url.trim() !== '') {
      window.open(url, '_blank');
    } else {
      toast.error('No valid link configured for this button');
    }
  };

  return (
    <div className="bg-navbarBg rounded-xl shadow-sm border border-border h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Live Preview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">See how your banner will look to users</p>
      </div>

      <div className="p-6 flex-1 bg-navbarBg border-b border-border rounded-b-xl flex flex-col items-center">
        {/* Toggle */}
        <div className="flex p-1 bg-navbarBg rounded-full border border-border mb-8 max-w-md w-full gap-2">
          <button
            onClick={() => setViewMode('web')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'web' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-customShadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <Monitor className="w-4 h-4" />
            Web
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'mobile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-customShadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>

        {/* Preview Container */}
        <div
          className={`transition-all duration-300 ease-in-out ${viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
            }`}
        >
          {/* The Banner Itself */}
          <div className="banner-container rounded-xl overflow-hidden shadow-lg relative bg-gradient-to-r from-[#005C97] to-[#363795] text-white p-8 group">
            {/* Custom CSS injection */}
            {data.customCSS && (
              <style>
                {data.customCSS}
              </style>
            )}

            <div className={`flex ${viewMode === 'mobile' ? 'flex-col text-center' : 'items-center justify-between'}`}>
              <div className={`banner-text-content ${viewMode === 'mobile' ? 'mb-6' : 'max-w-[60%]'}`}>
                <h3 className={`banner-title font-bold mb-2 ${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  {data.title || 'Your Banner Title'}
                </h3>
                <p className={`banner-desc text-blue-100 mb-6 ${viewMode === 'mobile' ? 'text-sm' : 'text-base'}`}>
                  {data.description || 'Your banner description goes here.'}
                </p>

                <div className={`banner-buttons flex gap-3 ${viewMode === 'mobile' ? 'justify-center flex-col' : 'flex-row'}`}>
                  <button 
                    onClick={() => handleButtonClick(data.primaryButtonLink)}
                    className="primary-btn px-6 py-2.5 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-customShadow cursor-pointer"
                  >
                    {data.primaryButtonLabel || 'Get Started'}
                    {data.primaryButtonLabel && PrimaryIcon && <PrimaryIcon className="w-4 h-4" />}
                  </button>

                  {data.enableSecondaryButton && (
                    <button 
                      onClick={() => handleButtonClick(data.secondaryButtonLink)}
                      className="secondary-btn px-6 py-2.5 bg-blue-800/30 text-white border border-blue-400/30 rounded-lg font-medium hover:bg-blue-800/50 transition-colors backdrop-blur-sm flex items-center justify-center gap-2 shadow-customShadow cursor-pointer"
                    >
                      {data.secondaryButtonLabel || 'Learn More'}
                      {SecondaryIcon && <SecondaryIcon className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Image Placeholder */}
              <div className={`banner-image-container ${viewMode === 'mobile' ? 'mt-4 hidden' : ''}`}>
                {/* Circle decorative background */}
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full transform scale-150"></div>

                  {data.image ? (
                    <div className="md:mr-2 lg:mr-4 xl:mr-10 md:block hidden">
                      <Image
                        src={data.image}
                        alt="Banner Preview Image"
                        height={180}
                        width={180}
                        style={{ transform: "scale(1.25)" }}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="md:mr-2 lg:mr-4 xl:mr-10 md:block hidden">
                      <Image
                        src="/userDashboard/img3.webp"
                        alt="Default Banner Preview"
                        height={180}
                        width={180}
                        style={{ transform: "scale(1.25)" }}
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Floating Elements (Visual Flair) */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-blue-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 bg-purple-400 rounded-full blur-md opacity-60 animate-bounce"></div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}