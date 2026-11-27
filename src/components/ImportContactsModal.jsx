import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Upload, FileSpreadsheet, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Spinner } from './Skeleton';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SAMPLE_CSV = `Email,First Name,Last Name,City,Plan
new1@test.com,Ann,Lee,Kandy,Pro
kasun.p@example.com,Kasun,Perera,Colombo,Free
ravi.herath88@demo.org,Ravi,Herath,Colombo,Pro
not-an-email,Bad,Row,Galle,Free`;

function parseCSV(text) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentLine.push(currentField.trim());
        if (currentLine.some((cell) => cell !== '')) lines.push(currentLine);
        currentLine = [];
        currentField = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        currentLine.push(currentField.trim());
        if (currentLine.some((cell) => cell !== '')) lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField !== '' || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some((cell) => cell !== '')) lines.push(currentLine);
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0];
  const rows = lines.slice(1).map((row) =>
    headers.map((_, idx) => (row[idx] !== undefined ? row[idx] : ''))
  );

  return { headers, rows };
}

function guessMapping(header) {
  const h = header.toLowerCase().trim();
  if (h.includes('email') || h === 'e-mail') return 'email';
  if (h === 'first name' || h === 'firstname' || h === 'first_name') return 'firstName';
  if (h === 'last name' || h === 'lastname' || h === 'last_name') return 'lastName';
  if (h === 'name' || h === 'full name' || h === 'fullname') return 'fullName';
  if (h.includes('city') || h.includes('location')) return 'city';
  if (h.includes('plan') || h.includes('tier')) return 'plan';
  return `custom:${header.trim()}`;
}

export default function ImportContactsModal({ isOpen, onClose }) {
  const { contacts, groups, addImportedContacts, notify } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mappings, setMappings] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [agreedConsent, setAgreedConsent] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState(['Newsletter']);
  const [signupSource, setSignupSource] = useState('In-store signup sheet');
  const [signupDate, setSignupDate] = useState('November 2026');

  const processCSVContent = (name, content) => {
    const parsed = parseCSV(content);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      alert('The CSV file appears to be empty or has no data rows.');
      return;
    }

    const initialMappings = {};
    parsed.headers.forEach((header, idx) => {
      initialMappings[idx] = guessMapping(header);
    });

    setFileName(name);
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setMappings(initialMappings);
    setShowPreview(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      processCSVContent(file.name, event.target?.result || '');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      processCSVContent(file.name, event.target?.result || '');
    };
    reader.readAsText(file);
  };

  const resetFile = () => {
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMappings({});
    setShowPreview(false);
  };

  const toggleGroup = (group) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  // Validate rows dynamically based on current column mappings
  const validation = useMemo(() => {
    const emailColIdx = Object.keys(mappings).find((idx) => mappings[idx] === 'email');
    const existingEmails = new Set(contacts.map((c) => c.email.toLowerCase()));
    const seenInFile = new Set();

    const ready = [];
    const duplicates = [];
    const invalid = [];

    if (emailColIdx === undefined) {
      return { ready, duplicates, invalid: rows.map((r, i) => ({ rowIndex: i + 1, row: r, email: '' })) };
    }

    rows.forEach((row, idx) => {
      const rawEmail = (row[emailColIdx] || '').trim();
      const lowerEmail = rawEmail.toLowerCase();

      if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
        invalid.push({ rowIndex: idx + 1, row, email: rawEmail });
      } else if (existingEmails.has(lowerEmail) || seenInFile.has(lowerEmail)) {
        duplicates.push({ rowIndex: idx + 1, row, email: rawEmail });
      } else {
        seenInFile.add(lowerEmail);
        ready.push({ rowIndex: idx + 1, row, email: rawEmail });
      }
    });

    return { ready, duplicates, invalid };
  }, [rows, mappings, contacts]);

  const handleDownloadInvalid = () => {
    if (validation.invalid.length === 0) return;
    const csvLines = [
      headers.join(','),
      ...validation.invalid.map((item) =>
        item.row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invalid-emails.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (validation.ready.length === 0) {
      notify({ type: 'warning', message: 'No valid new contacts to import.' });
      return;
    }

    const findCol = (type) => Object.keys(mappings).find((idx) => mappings[idx] === type);
    const emailIdx = findCol('email');
    const firstIdx = findCol('firstName');
    const lastIdx = findCol('lastName');
    const fullIdx = findCol('fullName');
    const cityIdx = findCol('city');
    const planIdx = findCol('plan');

    const newContacts = validation.ready.map(({ row }) => {
      const email = (row[emailIdx] || '').trim();
      let fullName = '';
      if (fullIdx !== undefined && row[fullIdx]) {
        fullName = row[fullIdx].trim();
      } else {
        const first = firstIdx !== undefined ? (row[firstIdx] || '').trim() : '';
        const last = lastIdx !== undefined ? (row[lastIdx] || '').trim() : '';
        fullName = `${first} ${last}`.trim();
      }
      if (!fullName) {
        fullName = email.split('@')[0];
      }

      const nameParts = fullName.split(/\s+/);
      const initials =
        nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : fullName.slice(0, 2).toUpperCase();

      const city = cityIdx !== undefined && row[cityIdx] ? row[cityIdx].trim() : '—';
      const rawPlan = planIdx !== undefined && row[planIdx] ? row[planIdx].trim() : 'Free';
      const plan = ['Free', 'Pro', 'Business'].includes(rawPlan) ? rawPlan : rawPlan || 'Free';

      return {
        id: `${email.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: fullName,
        initials,
        email,
        city,
        plan,
        groups: selectedGroups.length > 0 ? selectedGroups : ['Newsletter'],
        consent: signupSource,
        consentDate: signupDate,
        lastActivity: 'Imported just now',
        status: 'Subscribed',
        stats: { received: 0, opened: 0, clicked: 0 },
        activity: [
          {
            id: Date.now(),
            type: 'group',
            title: `Imported via ${fileName}`,
            time: 'Just now',
            category: 'Changes',
          },
        ],
      };
    });

    setImporting(true);
    try {
      await addImportedContacts(newContacts);
      resetFile();
      onClose();
      navigate('/contacts');
    } catch (err) {
      notify({ type: 'error', title: 'Import failed', message: err.message });
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  const availableGroups = groups.map((g) => g.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Import contacts</h2>
            {fileName ? (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  {fileName}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {rows.length} {rows.length === 1 ? 'row' : 'rows'} · {headers.length}{' '}
                  {headers.length === 1 ? 'column' : 'columns'}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-gray-600 hover:text-black underline ml-1"
                >
                  Change file
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                Upload a CSV file to preview columns and import subscribers
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Upload Dropzone OR Parsed CSV Mapping Flow */}
        {!fileName ? (
          <div className="p-6 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400 bg-[#fafafa]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Click to choose a CSV file or drag it here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Include a header row with Email, First Name, Last Name, City, Plan, etc.
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                Select CSV file
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
              <span className="text-gray-600 font-medium">
                Want to test how CSV mapping works first?
              </span>
              <button
                type="button"
                onClick={() => processCSVContent('contacts.csv', SAMPLE_CSV)}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 font-bold text-gray-800 transition-colors"
              >
                Load sample contacts.csv
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Step 1: Match columns */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-bold text-sm text-gray-900">Match columns</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showPreview ? 'Hide CSV preview' : 'Preview CSV data'}</span>
                  {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Optional Live CSV Table Preview */}
              {showPreview && (
                <div className="mb-3 bg-white border border-gray-200 rounded-2xl overflow-x-auto max-h-44 text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        {headers.map((h, i) => (
                          <th key={i} className="py-2 px-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.slice(0, 10).map((r, rIdx) => (
                        <tr key={rIdx} className="hover:bg-gray-50">
                          <td className="py-1.5 px-3 text-gray-400 font-mono">{rIdx + 1}</td>
                          {r.map((cell, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 text-gray-700 whitespace-nowrap max-w-[160px] truncate">
                              {cell || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-2 text-xs">
                <div className="grid grid-cols-3 font-semibold text-gray-500 pb-1 border-b border-gray-200/60 px-2">
                  <span>Column in your file</span>
                  <span>Example</span>
                  <span>Save as</span>
                </div>

                {headers.map((header, idx) => {
                  const exampleVal = rows[0]?.[idx] || '—';
                  const currentMapping = mappings[idx] || 'skip';
                  const isNewCustom = currentMapping.startsWith('custom:');

                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-3 items-center gap-2 px-2 py-1.5 hover:bg-white rounded-xl transition-colors"
                    >
                      <span className="font-medium text-gray-800 truncate">{header}</span>
                      <span className="text-gray-500 truncate">{exampleVal}</span>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={currentMapping}
                          onChange={(e) => setMappings({ ...mappings, [idx]: e.target.value })}
                          className="bg-white border border-gray-200 rounded-lg p-1.5 font-medium text-gray-800 focus:outline-none focus:border-black text-xs flex-1 min-w-0"
                        >
                          <option value="email">Email (required)</option>
                          <option value="firstName">First name</option>
                          <option value="lastName">Last name</option>
                          <option value="fullName">Full name</option>
                          <option value="city">City (custom field)</option>
                          <option value="plan">Plan</option>
                          <option value={`custom:${header}`}>+ Create field "{header}"</option>
                          <option value="skip">Do not import</option>
                        </select>
                        {isNewCustom && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Validation Count Boxes */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-emerald-800">{validation.ready.length}</p>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">Ready to import</p>
                </div>
                <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-gray-700">{validation.duplicates.length}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">Duplicate skipped</p>
                </div>
                <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3">
                  <p className="text-2xl font-bold text-rose-800">{validation.invalid.length}</p>
                  <div className="text-xs font-semibold text-rose-700 mt-0.5 flex items-center justify-between gap-1">
                    <span>Invalid email</span>
                    {validation.invalid.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDownloadInvalid}
                        className="underline hover:text-rose-900"
                      >
                        download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Add to groups */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-gray-900">Add to groups</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableGroups.map((group) => {
                  const isSelected = selectedGroups.includes(group);
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          isSelected ? 'border-white bg-white/20' : 'border-gray-400'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {group}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Import details (Optional) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-sm text-gray-900">Import source (optional)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Source label
                  </label>
                  <select
                    value={signupSource}
                    onChange={(e) => setSignupSource(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-black"
                  >
                    <option>CSV import</option>
                    <option>In-store signup sheet</option>
                    <option>Website newsletter form</option>
                    <option>Conference / Event</option>
                    <option>Customer checkout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input
                    type="text"
                    value={signupDate}
                    onChange={(e) => setSignupDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
          <p className="text-[11.5px] text-gray-500 font-medium">
            Unsubscribed, bounced and complained contacts stay suppressed.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            {fileName && (
              <button
                type="button"
                onClick={handleImport}
                disabled={validation.ready.length === 0 || importing}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
              >
                {importing ? <Spinner className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                <span>
                  {importing
                    ? 'Importing...'
                    : `Import ${validation.ready.length} ${validation.ready.length === 1 ? 'contact' : 'contacts'}`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
