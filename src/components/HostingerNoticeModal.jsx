import React from 'react';
import { X, Server, Database, Globe, CheckCircle2, Copy } from 'lucide-react';

export default function HostingerNoticeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hostinger hPanel & Backend Ready</h2>
              <p className="text-xs text-gray-500">React + React Router + Node.js + MySQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-4 text-xs text-gray-700">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <h3 className="font-bold text-emerald-900 text-sm mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Hostinger hPanel SPA Routing (.htaccess included)
            </h3>
            <p className="text-emerald-800 leading-relaxed">
              In Vite React SPAs deployed to Hostinger hPanel Apache / OpenLiteSpeed, reloading routes like <code className="bg-white/80 px-1 py-0.5 rounded font-mono">/campaigns</code> requires a rewrite rule. We have automatically generated the <code className="bg-white/80 px-1 py-0.5 rounded font-mono">public/.htaccess</code> file, so when you run <code className="bg-white/80 px-1 py-0.5 rounded font-mono">npm run build</code>, the built <code className="bg-white/80 px-1 py-0.5 rounded font-mono">dist/</code> folder is 100% ready to upload directly into your Hostinger <b>public_html</b>.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-700" />
              2. Node.js + MySQL Backend Integration
            </h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              The frontend is equipped with an API client layer at <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono">src/services/api.js</code>. You can host your Node.js backend using Hostinger's Node.js selector in hPanel or via reverse proxy.
            </p>
            <div className="bg-neutral-900 text-neutral-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto relative group">
              <button 
                onClick={() => copyToClipboard('// In .env or hPanel environment variables:\nVITE_API_BASE_URL=https://yourdomain.com/api')}
                className="absolute right-2 top-2 p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300"
                title="Copy config"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <pre>{`// In .env or hPanel environment variables:
VITE_API_BASE_URL=https://yourdomain.com/api`}</pre>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <h3 className="font-bold text-amber-900 text-sm mb-1">
              3. Production Build Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-amber-800">
              <li>Run <code className="bg-white/80 px-1 py-0.5 rounded font-mono">npm run build</code> in this project.</li>
              <li>Open Hostinger hPanel &gt; File Manager &gt; <code className="bg-white/80 px-1 py-0.5 rounded font-mono">public_html</code>.</li>
              <li>Upload all files from the generated <code className="bg-white/80 px-1 py-0.5 rounded font-mono">dist</code> folder (including <code className="bg-white/80 px-1 py-0.5 rounded font-mono">.htaccess</code>).</li>
            </ol>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
