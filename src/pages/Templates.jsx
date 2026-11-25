import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Type, 
  AlignLeft, 
  AlignCenter,
  AlignRight,
  RectangleHorizontal, 
  Image as ImageIcon, 
  Columns, 
  Minus, 
  Smartphone, 
  Monitor, 
  Check, 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  ExternalLink,
  Code2,
  FileText,
  Eye,
  CheckCircle2,
  Plus,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadsApi } from '../services/api';
import { Spinner, DashboardSkeleton } from '../components/Skeleton';

export default function Templates() {
  const navigate = useNavigate();
  const { templates, dataLoading, updateTemplate, createTemplate, notify } = useApp();
  const [activeTemplateId, setActiveTemplateId] = useState('monthly-newsletter');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [editorMode, setEditorMode] = useState('Visual'); // 'Visual', 'HTML', 'Plain text'
  const [devicePreview, setDevicePreview] = useState('Desktop'); // 'Desktop' or 'Mobile'
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved All changes saved · Just now');

  // Inbox details
  const [subject, setSubject] = useState('Our monthly update, {{firstName}}');
  const [previewText, setPreviewText] = useState('New features, bug fixes and what’s next');

  // Blocks array
  const [blocks, setBlocks] = useState([
    { 
      id: 'b1', 
      type: 'heading', 
      content: 'Hello {{firstName}}', 
      size: 'text-2xl',
      align: 'left'
    },
    { 
      id: 'b2', 
      type: 'text', 
      content: 'Here is what happened this month. We shipped new features, fixed bugs and planned what comes next.',
      align: 'left'
    },
    { 
      id: 'b3', 
      type: 'button', 
      label: 'Read the full update', 
      link: 'https://example.com/blog',
      color: '#111111',
      corners: 'Rounded'
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState('b3');

  // Currently selected block
  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];

  const updateSelectedBlock = (updates) => {
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, ...updates } : b));
    setSaveStatus('Saved All changes saved · Just now');
  };

  const addBlock = (type) => {
    const newId = `b-${Date.now()}`;
    let newBlock;
    if (type === 'heading') {
      newBlock = { id: newId, type: 'heading', content: 'New Heading', size: 'text-xl', align: 'left' };
    } else if (type === 'text') {
      newBlock = { id: newId, type: 'text', content: 'Write your email body text here...', align: 'left' };
    } else if (type === 'button') {
      newBlock = { id: newId, type: 'button', label: 'Call to action', link: 'https://example.com', color: '#111111', corners: 'Rounded' };
    } else if (type === 'image') {
      newBlock = { id: newId, type: 'image', url: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?w=800&q=80', alt: 'Product image' };
    } else if (type === 'columns') {
      newBlock = { id: newId, type: 'columns', leftCol: 'Left column feature content', rightCol: 'Right column feature content' };
    } else if (type === 'divider') {
      newBlock = { id: newId, type: 'divider', color: '#e5e7eb' };
    }

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newId);
  };

  const moveBlock = (id, direction) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    setBlocks(newBlocks);
  };

  const duplicateBlock = (id) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index < 0) return;
    const blockToCopy = blocks[index];
    const newId = `b-${Date.now()}`;
    const copy = { ...blockToCopy, id: newId };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, copy);
    setBlocks(newBlocks);
    setSelectedBlockId(newId);
  };

  const deleteBlock = (id) => {
    if (blocks.length <= 1) {
      alert('Keep at least one block in the template.');
      return;
    }
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    setSelectedBlockId(newBlocks[0].id);
  };

  // Preview replacement: converts {{firstName}} into Jane
  const renderInterpolated = (text) => {
    if (!text) return '';
    return text.replace(/\{\{\s*firstName\s*\}\}/gi, 'Jane');
  };

  // Generate real HTML
  const generateHTMLCode = () => {
    const bodyHtml = blocks.map(b => {
      if (b.type === 'heading') {
        return `<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111827; text-align: ${b.align || 'left'};">${b.content}</h1>`;
      }
      if (b.type === 'text') {
        return `<p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 16px; text-align: ${b.align || 'left'};">${b.content}</p>`;
      }
      if (b.type === 'button') {
        const radius = b.corners === 'Rounded' ? '12px' : b.corners === 'Pill' ? '9999px' : '0px';
        return `<div style="margin: 20px 0;"><a href="${b.link}" style="display: block; text-align: center; background-color: ${b.color}; color: #ffffff; padding: 12px 24px; border-radius: ${radius}; font-weight: bold; font-size: 14px; text-decoration: none;">${b.label}</a></div>`;
      }
      if (b.type === 'image') {
        return `<div style="margin: 20px 0;"><img src="${b.url}" alt="${b.alt || 'Email Image'}" style="width: 100%; max-width: 100%; border-radius: 12px; display: block;" /></div>`;
      }
      if (b.type === 'columns') {
        return `<table style="width: 100%; margin: 16px 0;"><tr><td style="width: 50%; vertical-align: top; padding-right: 8px;"><p style="font-size: 13px; color: #4b5563;">${b.leftCol}</p></td><td style="width: 50%; vertical-align: top; padding-left: 8px;"><p style="font-size: 13px; color: #4b5563;">${b.rightCol}</p></td></tr></table>`;
      }
      if (b.type === 'divider') {
        return `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />`;
      }
      return '';
    }).join('\n      ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
    <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
    <div style="text-align: right; font-size: 11px; color: #9ca3af; margin-bottom: 20px;">Acme Team</div>
    <main>
      ${bodyHtml}
    </main>
    <footer style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; text-align: center;">
      <p>Acme Team · 45 Example Street, Colombo 03, Sri Lanka</p>
      <p>You received this because you are subscribed. <a href="{{unsubscribeUrl}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a></p>
    </footer>
  </div>
</body>
</html>`;
  };

  // Generate real plain text
  const generatePlainText = () => {
    const lines = blocks.map(b => {
      if (b.type === 'heading') return `${b.content.toUpperCase()}\n-------------------`;
      if (b.type === 'text') return b.content;
      if (b.type === 'button') return `[ ${b.label} ]: ${b.link}`;
      if (b.type === 'image') return `[Image: ${b.alt || 'Photo'}] (${b.url})`;
      if (b.type === 'columns') return `Column 1: ${b.leftCol}\nColumn 2: ${b.rightCol}`;
      if (b.type === 'divider') return `----------------------------------------`;
      return '';
    });

    return `SUBJECT: ${subject}\nPREVIEW: ${previewText}\n\n${lines.join('\n\n')}\n\n---\nAcme Team · 45 Example Street, Colombo 03, Sri Lanka\nUnsubscribe: {{unsubscribeUrl}}`;
  };

  const handleCopyCode = () => {
    const code = editorMode === 'HTML' ? generateHTMLCode() : generatePlainText();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSwitchTemplate = (tplId) => {
    setActiveTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    setSubject(tpl.subject);
    setPreviewText(tpl.previewText);
    setBlocks([
      { id: 'b1', type: 'heading', content: tpl.heading, size: 'text-2xl', align: 'left' },
      { id: 'b2', type: 'text', content: tpl.body, align: 'left' },
      { id: 'b3', type: 'button', label: tpl.ctaLabel, link: tpl.ctaUrl, color: tpl.ctaColor, corners: 'Rounded' }
    ]);
    setSelectedBlockId('b3');
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const headingBlock = blocks.find((b) => b.type === 'heading');
      const textBlock = blocks.find((b) => b.type === 'text');
      const btnBlock = blocks.find((b) => b.type === 'button');
      await updateTemplate(activeTemplateId, {
        subject,
        previewText,
        heading: headingBlock?.content || 'Hello {{firstName}}',
        body: textBlock?.content || '',
        ctaLabel: btnBlock?.label || 'Read more',
        ctaUrl: btnBlock?.link || 'https://example.com',
        ctaColor: btnBlock?.color || '#111111',
        blocks,
      });
      setSaveStatus('Saved to server · Just now');
    } catch (err) {
      notify({ type: 'error', title: 'Save failed', message: err.message });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleNewTemplate = async () => {
    const name = window.prompt('Enter new template name:', 'Special Announcement');
    if (!name || !name.trim()) return;
    try {
      const created = await createTemplate({ name: name.trim() });
      handleSwitchTemplate(created.id);
    } catch (err) {
      notify({ type: 'error', message: err.message });
    }
  };

  if (dataLoading && templates.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <select
              value={activeTemplateId}
              onChange={(e) => handleSwitchTemplate(e.target.value)}
              className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 bg-transparent focus:outline-none cursor-pointer pr-2"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>✓ {saveStatus}</span>
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-2xl shadow-2xs self-start sm:self-auto">
          {['Visual', 'HTML', 'Plain text'].map((mode) => (
            <button
              key={mode}
              onClick={() => setEditorMode(mode)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                editorMode === mode ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleNewTemplate}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button
            type="button"
            disabled={savingTemplate}
            onClick={handleSaveTemplate}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            {savingTemplate ? <Spinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savingTemplate ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={() => navigate(`/campaigns/new?template=${activeTemplateId}`)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Use in campaign
          </button>
        </div>
      </div>

      {/* Main 3-Column / Tab Area */}
      {editorMode === 'Visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Drag / Click Blocks (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between lg:block">
              <h2 className="text-xs font-bold text-gray-900">Add Blocks</h2>
              <p className="text-[11px] text-gray-400">Click to insert</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-1 gap-1.5">
              {[
                { type: 'heading', label: 'Heading', icon: 'H' },
                { type: 'text', label: 'Text', icon: '≡' },
                { type: 'button', label: 'Button', icon: '⬭' },
                { type: 'image', label: 'Image', icon: '🖼' },
                { type: 'columns', label: 'Columns', icon: '⫿' },
                { type: 'divider', label: 'Divider', icon: '—' },
              ].map((b) => (
                <button
                  key={b.type}
                  onClick={() => addBlock(b.type)}
                  className="flex items-center justify-center lg:justify-start gap-2 p-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100/70 border border-gray-100 hover:border-gray-200 transition-all text-left"
                >
                  <span className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-700 shrink-0">
                    {b.icon}
                  </span>
                  <span className="truncate">{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Real Live Canvas Preview (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="inline-flex rounded-xl bg-gray-100 p-0.5">
                <button
                  onClick={() => setDevicePreview('Desktop')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    devicePreview === 'Desktop' ? 'bg-black text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setDevicePreview('Mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    devicePreview === 'Mobile' ? 'bg-black text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <span className="text-[11px] text-gray-400 font-medium">Click any block to edit copy &amp; style</span>
            </div>

            {/* Canvas Outer Wrapper */}
            <div className="p-3 sm:p-8 rounded-3xl bg-[#fed7aa]/20 border border-[#fdba74]/40 flex justify-center min-h-[460px]">
              <div 
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5 transition-all ${
                  devicePreview === 'Mobile' ? 'max-w-xs w-full' : 'max-w-md w-full'
                }`}
              >
                {/* Dynamically Render All Blocks with Live Content */}
                {blocks.map((block) => {
                  const isSelected = selectedBlockId === block.id;

                  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const headingBlock = blocks.find((b) => b.type === 'heading');
      const textBlock = blocks.find((b) => b.type === 'text');
      const btnBlock = blocks.find((b) => b.type === 'button');
      await updateTemplate(activeTemplateId, {
        subject,
        previewText,
        heading: headingBlock?.content || 'Hello {{firstName}}',
        body: textBlock?.content || '',
        ctaLabel: btnBlock?.label || 'Read more',
        ctaUrl: btnBlock?.link || 'https://example.com',
        ctaColor: btnBlock?.color || '#111111',
        blocks,
      });
      setSaveStatus('Saved to server · Just now');
    } catch (err) {
      notify({ type: 'error', title: 'Save failed', message: err.message });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleNewTemplate = async () => {
    const name = window.prompt('Enter new template name:', 'Special Announcement');
    if (!name || !name.trim()) return;
    try {
      const created = await createTemplate({ name: name.trim() });
      handleSwitchTemplate(created.id);
    } catch (err) {
      notify({ type: 'error', message: err.message });
    }
  };

  if (dataLoading && templates.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
                    <div 
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`relative group rounded-xl transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-black bg-gray-50/50 p-2 -m-2' : 'hover:bg-gray-50/80 p-1 -m-1'
                      }`}
                    >
                      {/* Floating Mini Action Toolbar on Selected Block */}
                      {isSelected && (
                        <div className="absolute -top-3.5 left-2 bg-neutral-900 text-white rounded-lg px-2 py-0.5 text-[10.5px] font-bold flex items-center gap-2 shadow-md z-20">
                          <span className="capitalize text-amber-300">{block.type}</span>
                          <button 
                            type="button" 
                            title="Move Up"
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                            className="hover:text-amber-400 p-0.5"
                          >
                            ↑
                          </button>
                          <button 
                            type="button" 
                            title="Move Down"
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                            className="hover:text-amber-400 p-0.5"
                          >
                            ↓
                          </button>
                          <button 
                            type="button" 
                            title="Duplicate"
                            onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
                            className="hover:text-amber-400 p-0.5"
                          >
                            ⧉
                          </button>
                          <button 
                            type="button" 
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                            className="hover:text-rose-400 p-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Render block based on type */}
                      {block.type === 'heading' && (
                        <h1 className={`font-extrabold text-gray-900 tracking-tight text-${block.align || 'left'} ${block.size || 'text-2xl'}`}>
                          {renderInterpolated(block.content)}
                        </h1>
                      )}

                      {block.type === 'text' && (
                        <p className={`text-xs text-gray-600 leading-relaxed text-${block.align || 'left'}`}>
                          {renderInterpolated(block.content)}
                        </p>
                      )}

                      {block.type === 'button' && (
                        <div className="pt-2 pb-1">
                          <button 
                            style={{ backgroundColor: block.color }}
                            className={`w-full py-3 px-6 text-white text-xs font-bold shadow-sm transition-transform active:scale-95 ${
                              block.corners === 'Rounded' ? 'rounded-xl' : block.corners === 'Pill' ? 'rounded-full' : 'rounded-none'
                            }`}
                          >
                            {block.label}
                          </button>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="rounded-xl overflow-hidden border border-gray-100">
                          <img 
                            src={block.url} 
                            alt={block.alt} 
                            className="w-full h-40 object-cover" 
                          />
                        </div>
                      )}

                      {block.type === 'columns' && (
                        <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <div>{block.leftCol}</div>
                          <div>{block.rightCol}</div>
                        </div>
                      )}

                      {block.type === 'divider' && (
                        <div className="py-2">
                          <hr className="border-gray-200" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Email Footer */}
                <div className="pt-6 border-t border-gray-100 text-[10.5px] text-gray-400 leading-relaxed text-center space-y-1">
                  <p className="flex items-center justify-center gap-1 font-medium text-gray-500">
                    <span>🔒 Acme Team · 45 Example Street, Colombo 03, Sri Lanka</span>
                  </p>
                  <p>
                    You’re getting this because you subscribed. <a href="/preferences" className="underline hover:text-gray-600">Unsubscribe</a> · <a href="/preferences" className="underline hover:text-gray-600">Email preferences</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Inspector Properties & Live Inbox Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live Inbox Subject & Preview Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold text-gray-900">Inbox details (Live synchronized)</h2>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-gray-500">Preview text</label>
                  <span className="text-[10px] text-gray-400 font-mono">{previewText.length} / 90</span>
                </div>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                />
              </div>

              {/* Real-time Inbox Simulation Snippet */}
              <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100 flex items-start gap-2.5 text-xs">
                <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  AT
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-[11.5px] leading-tight">Acme Team</p>
                  <p className="text-gray-800 text-[11px] truncate">
                    {renderInterpolated(subject)} — <span className="text-gray-400 font-normal">{previewText}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Selected Block Inspector (Updates as user clicks blocks) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-900 capitalize">
                  Edit Selected Block: {selectedBlock?.type}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  Active
                </span>
              </div>

              {/* HEADING INSPECTOR */}
              {selectedBlock?.type === 'heading' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Heading Text</label>
                    <input
                      type="text"
                      value={selectedBlock.content}
                      onChange={(e) => updateSelectedBlock({ content: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Size</label>
                      <select
                        value={selectedBlock.size || 'text-2xl'}
                        onChange={(e) => updateSelectedBlock({ size: e.target.value })}
                        className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 font-medium"
                      >
                        <option value="text-xl">Medium (XL)</option>
                        <option value="text-2xl">Large (2XL)</option>
                        <option value="text-3xl">Extra Large (3XL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Align</label>
                      <select
                        value={selectedBlock.align || 'left'}
                        onChange={(e) => updateSelectedBlock({ align: e.target.value })}
                        className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 font-medium"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TEXT INSPECTOR */}
              {selectedBlock?.type === 'text' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Paragraph Content</label>
                    <textarea
                      rows={4}
                      value={selectedBlock.content}
                      onChange={(e) => updateSelectedBlock({ content: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900 focus:outline-none focus:border-black leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Align</label>
                    <select
                      value={selectedBlock.align || 'left'}
                      onChange={(e) => updateSelectedBlock({ align: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 font-medium"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}

              {/* BUTTON INSPECTOR */}
              {selectedBlock?.type === 'button' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Button Label</label>
                    <input
                      type="text"
                      value={selectedBlock.label}
                      onChange={(e) => updateSelectedBlock({ label: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 font-bold text-gray-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Destination URL</label>
                    <input
                      type="text"
                      value={selectedBlock.link}
                      onChange={(e) => updateSelectedBlock({ link: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 font-mono text-gray-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Background Color</label>
                      <div className="flex items-center gap-2 bg-[#fafafa] border border-gray-200 rounded-xl p-1.5">
                        <input
                          type="color"
                          value={selectedBlock.color || '#111111'}
                          onChange={(e) => updateSelectedBlock({ color: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[11px] font-mono text-gray-700">{selectedBlock.color || '#111111'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Corners</label>
                      <select
                        value={selectedBlock.corners || 'Rounded'}
                        onChange={(e) => updateSelectedBlock({ corners: e.target.value })}
                        className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 font-medium"
                      >
                        <option>Rounded</option>
                        <option>Pill</option>
                        <option>Sharp</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Clicks on this button are tracked</span>
                  </div>
                </div>
              )}

              {/* IMAGE INSPECTOR */}
              {selectedBlock?.type === 'image' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Upload Image to Server</label>
                    <label className="w-full py-2 px-3 rounded-xl bg-black text-white hover:bg-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                      {uploadingImage ? <Spinner className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      <span>{uploadingImage ? 'Uploading to server...' : 'Choose & upload image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImage(true);
                          try {
                            const res = await uploadsApi.uploadImage(file);
                            updateSelectedBlock({
                              url: res.url,
                              alt: selectedBlock.alt || file.name.replace(/\.[^/.]+$/, '')
                            });
                            notify({ type: 'success', title: 'Image uploaded', message: 'Public URL inserted into template.' });
                          } catch (err) {
                            notify({ type: 'error', title: 'Upload failed', message: err.message });
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10.5px] text-gray-400 mt-1">
                      Saves to your Node.js server (/uploads) and inserts the public link.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Image URL (HTTPS)</label>
                    <input
                      type="text"
                      value={selectedBlock.url}
                      onChange={(e) => updateSelectedBlock({ url: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 font-mono text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={selectedBlock.alt}
                      onChange={(e) => updateSelectedBlock({ alt: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 font-medium text-gray-900"
                    />
                  </div>
                </div>
              )}

              {/* COLUMNS INSPECTOR */}
              {selectedBlock?.type === 'columns' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Left Column Content</label>
                    <textarea
                      rows={2}
                      value={selectedBlock.leftCol}
                      onChange={(e) => updateSelectedBlock({ leftCol: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Right Column Content</label>
                    <textarea
                      rows={2}
                      value={selectedBlock.rightCol}
                      onChange={(e) => updateSelectedBlock({ rightCol: e.target.value })}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* HTML OR PLAIN TEXT GENERATED LIVE CODE VIEW */
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Generated {editorMode} Code (Live Sync)
              </h2>
              <p className="text-xs text-gray-400">
                Instantly reflects all your changes and block additions
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied to Clipboard!' : `Copy ${editorMode}`}</span>
            </button>
          </div>

          <div className="bg-neutral-900 text-neutral-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[500px]">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {editorMode === 'HTML' ? generateHTMLCode() : generatePlainText()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
