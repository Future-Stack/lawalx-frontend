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
  mode?: 'custom' | 'prebuilt';
}

export default function BannerPreview({ data, mode = 'custom' }: BannerPreviewProps) {
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

  const backgroundStyle = data.backgroundStyle === 'GRADIENT'
    ? `linear-gradient(${data.backgroundDirection || 'to right'}, ${data.backgroundColor1 || '#005C97'}, ${data.backgroundColor2 || '#363795'})`
    : (data.backgroundColor1 || '#005C97');

  const getClipPath = (shape?: string) => {
    switch (shape?.toLowerCase()) {
      case 'circle': return 'circle(50% at 50% 50%)';
      case 'star': return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      case 'diamond': return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      default: return 'none';
    }
  };

  const imageStyles = {
    height: data.mediaHeight || 180,
    width: data.mediaWidth || 180,
    transform: "scale(1.25)",
    clipPath: getClipPath(data.mediaShape),
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
          className={`transition-all duration-300 ease-in-out ${viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-full'
            }`}
        >
          {mode === 'custom' ? (
            /* CUSTOM MODE */
            <div 
              className="banner-container rounded-xl overflow-hidden shadow-lg relative text-white group p-8"
              style={{ background: backgroundStyle }}
            >

              <div className={`flex ${viewMode === 'mobile' ? 'flex-col text-center' : (data.mediaPosition === 'LEFT' ? 'flex-row-reverse items-center justify-between' : 'items-center justify-between')}`}>
                <div className={`banner-text-content ${viewMode === 'mobile' ? 'mb-6' : 'max-w-[60%]'}`}>
                  <h3 className={`banner-title font-bold mb-2 ${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    {data.title || 'Your Banner Title'}
                  </h3>
                  <p className={`banner-desc text-blue-100 mb-6 ${viewMode === 'mobile' ? 'text-sm' : 'text-base'}`}>
                    {data.description || 'Your banner description goes here.'}
                  </p>

                  <div className={`banner-buttons flex gap-3 ${viewMode === 'mobile' ? 'justify-center flex-col' : 'flex-row'}`}>
                    <button 
                      className="primary-btn px-6 py-2.5 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-customShadow cursor-pointer"
                    >
                      {data.primaryButtonLabel || 'Get Started'}
                      {data.primaryButtonLabel && PrimaryIcon && <PrimaryIcon className="w-4 h-4" />}
                    </button>

                    {data.enableSecondaryButton && (
                      <button 
                        className="secondary-btn px-6 py-2.5 bg-blue-800/30 text-white border border-blue-400/30 rounded-lg font-medium hover:bg-blue-800/50 transition-colors backdrop-blur-sm flex items-center justify-center gap-2 shadow-customShadow cursor-pointer"
                      >
                        {data.secondaryButtonLabel || 'Learn More'}
                        {SecondaryIcon && <SecondaryIcon className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Container */}
                <div className={`banner-image-container ${viewMode === 'mobile' ? 'mt-4 hidden' : ''}`}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full transform scale-150"></div>

                    {data.image ? (
                      <div className={`${data.mediaPosition === 'LEFT' ? 'md:ml-2 lg:ml-4 xl:ml-10' : 'md:mr-2 lg:mr-4 xl:mr-10'} md:block hidden`}>
                        {(data.image.startsWith('data:video/') || data.image.match(/\.(mp4|webm|ogg)$/i) || data.file?.type.startsWith('video/')) ? (
                          <video
                            src={data.image}
                            className={data.mediaShape && data.mediaShape !== 'original' ? "object-cover" : "object-contain"}
                            style={imageStyles}
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={data.image}
                            alt="Banner Preview"
                            style={imageStyles}
                            className={data.mediaShape && data.mediaShape !== 'original' ? "object-cover" : "object-contain"}
                          />
                        )}
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

                    {/* Floating Elements */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-blue-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 bg-purple-400 rounded-full blur-md opacity-60 animate-bounce"></div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            </div>
          ) : (
            /* PREBUILT MODE */
            <a 
              href={data.bannerLinkRedirectURL || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-95 transition-opacity block group/prebuilt relative rounded-xl shadow-lg border border-border max-h-[180px] md:max-h-[300px]"
              onClick={(e) => {
                if (!data.bannerLinkRedirectURL) e.preventDefault();
              }}
            >
              {data.image ? (
                <>
                  {data.image.startsWith('data:video/') || data.image.match(/\.(mp4|webm|ogg)$/i) || data.file?.type.startsWith('video/') ? (
                    <video
                      src={data.image}
                      className="w-full h-full object-contain"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={data.image}
                      alt="Full Banner"
                      className="w-full h-full object-contain"
                    />
                  )}
                </>
              ) : (
                <div className="w-full aspect-[21/9] md:aspect-[4/1] flex flex-col items-center justify-center text-gray-400">
                  <Upload className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Upload a banner image</p>
                </div>
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}