'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';

function checkStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone);
}

function subscribeToMedia(callback) {
  if (typeof window === 'undefined') return () => {};
  const media = window.matchMedia('(display-mode: standalone)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

export default function InstallAppBanner() {
  const isStandalone = useSyncExternalStore(subscribeToMedia, checkStandalone, () => false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Android / Chrome beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (isStandalone || isDismissed) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      setShowIosInstructions(true);
    }
  };

  return (
    <>
      <div className="mb-6 p-4 rounded-3xl bg-gradient-to-l from-emerald-600/90 to-teal-700/90 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0">
            📲
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black">
              تثبيت &quot;سَكَن سبليت&quot; كتطبيق على هاتفك
            </h4>
            <p className="text-[11px] text-emerald-100">
              استخدمه كتطبيق رسمي يفتح بشاشة كاملة بدون شريط المتصفح ويعمل معك في أي وقت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>تثبيت التطبيق الآن</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="px-2.5 py-2 text-white/80 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-4xl block mb-3">📱</span>
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-2">
              طريقة التثبيت على الهاتف (iPhone / Safari)
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              لتثبيت التطبيق على شاشتك الرئيسية، اتبع الخطوتين:
            </p>

            <div className="space-y-3 text-right bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-start gap-2">
                <span className="font-black text-emerald-600 shrink-0">1.</span>
                <span>
                  اضغط على زر <strong>المشاركة (Share) ⎋</strong> أسفل شاشة المتصفح.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-black text-emerald-600 shrink-0">2.</span>
                <span>
                  انزل لأسفل واختر <strong>&quot;إضافة إلى الصفحة الرئيسية&quot; (Add to Home Screen ➕)</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIosInstructions(false)}
              className="mt-5 w-full py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs"
            >
              فهمت، شكراً!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
