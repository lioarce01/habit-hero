import React, { useState } from 'react';
import { Gift, X, Copy, Check } from 'lucide-react';

export const PromoCodeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const promoCode = "HERO2025";
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4">
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl border-2 border-yellow-400 p-4 shadow-2xl animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">LIMITED TIME OFFER!</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-yellow-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="text-white text-lg font-bold mb-1">
            🎉 Start Your Hero Journey FREE! 🎉
          </div>
          <div className="text-yellow-100 text-sm mb-3">
            Use promo code for exclusive early access
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-white bg-opacity-20 rounded-lg p-2 mb-2">
            <code className="text-white font-mono font-bold text-lg tracking-wider">
              {promoCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2 py-1 bg-white bg-opacity-20 rounded text-white hover:bg-opacity-30 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          </div>
          
          <div className="text-yellow-100 text-xs">
            ⚡ Unlock premium features • 🏆 Exclusive achievements • 🎮 Early access
          </div>
        </div>
      </div>
    </div>
  );
};