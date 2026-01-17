import React, { useState } from 'react';
import { LAYOUT_TYPES, REPORT_TYPES, PRIORITY_LEVELS } from '../utils/constants.js';

// Icon components
const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SquareIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ColumnsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const Grid3x3Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const Grid2x2Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const RowsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 17h16M4 11h16M4 13h16" />
  </svg>
);

const layoutOptions = [
  { type: LAYOUT_TYPES.SINGLE, icon: SquareIcon, label: 'Single', description: '1 image' },
  { type: LAYOUT_TYPES.TWO_ROW, icon: RowsIcon, label: '2 Rows', description: '2 images' },
  { type: LAYOUT_TYPES.TWO_COLUMN, icon: ColumnsIcon, label: 'Two Column', description: '2 images' },
  { type: LAYOUT_TYPES.THREE_GRID, icon: Grid3x3Icon, label: 'Three Grid', description: '3 images' },
  { type: LAYOUT_TYPES.FOUR_GRID, icon: Grid2x2Icon, label: '2×2 Grid', description: '4 images' },
];

const spacingOptions = [
  { type: 'small', label: 'Small' },
  { type: 'medium', label: 'Medium' },
  { type: 'large', label: 'Large' },
];

const backgroundOptions = [
  { type: 'white', color: '#FFFFFF', label: 'White' },
  { type: 'light-gray', color: '#F5F6F8', label: 'Light Gray' },
  { type: 'gradient', color: 'linear-gradient(135deg, #F5F6F8 0%, #E8EAF0 100%)', label: 'Gradient' },
];

export function LeftControls({
  metadata,
  layoutSettings,
  reportType,
  onMetadataChange,
  onLayoutSettingsChange,
  onReportTypeChange,
}) {
  const [newTag, setNewTag] = useState('');
  const [newStep, setNewStep] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      onMetadataChange({
        ...metadata,
        tags: [...metadata.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onMetadataChange({
      ...metadata,
      tags: metadata.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      const steps = metadata.stepsToReproduce || [];
      onMetadataChange({
        ...metadata,
        stepsToReproduce: [...steps, newStep.trim()]
      });
      setNewStep('');
    }
  };

  const handleRemoveStep = (indexToRemove) => {
    const steps = metadata.stepsToReproduce || [];
    onMetadataChange({
      ...metadata,
      stepsToReproduce: steps.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleStepKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStep();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Report Type Selector */}
      <section>
        <h2 className="text-lg text-gray-900 mb-4">Report Type</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onReportTypeChange(REPORT_TYPES.GENERAL)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm transition-all ${
              reportType === REPORT_TYPES.GENERAL
                ? 'bg-[#588AE8] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            General Report
          </button>
          <button
            onClick={() => onReportTypeChange(REPORT_TYPES.BUG)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm transition-all ${
              reportType === REPORT_TYPES.BUG
                ? 'bg-[#588AE8] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bug Report
          </button>
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Metadata Section */}
      <section>
        <h2 className="text-lg text-gray-900 mb-4">
          {reportType === REPORT_TYPES.BUG ? 'Bug Report Details' : 'Page Metadata'}
        </h2>
        
        <div className="space-y-4">
          {/* Report Title (Bug Report only, shown once) */}
          {reportType === REPORT_TYPES.BUG && (
            <>
              <div>
                <label htmlFor="reportTitle" className="block text-sm text-gray-700 mb-1.5">
                  Report Title
                </label>
                <input
                  id="reportTitle"
                  type="text"
                  value={metadata.title || ''}
                  onChange={(e) => onMetadataChange({ ...metadata, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#588AE8] focus:border-transparent transition-all"
                  placeholder="Bug Report: Login Flow Issue"
                />
              </div>

              {/* Report Subtitle (Bug Report only) */}
              <div>
                <label htmlFor="reportSubtitle" className="block text-sm text-gray-700 mb-1.5">
                  Report Subtitle
                </label>
                <input
                  id="reportSubtitle"
                  type="text"
                  value={metadata.subtitle || ''}
                  onChange={(e) => onMetadataChange({ ...metadata, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#588AE8] focus:border-transparent transition-all"
                  placeholder="Issue discovered during QA testing on January 15, 2026"
                />
              </div>
            </>
          )}

          {/* Title (General Report or when not bug report) */}
          {reportType === REPORT_TYPES.GENERAL && (
            <div>
              <label htmlFor="title" className="block text-sm text-gray-700 mb-1.5">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={metadata.title || ''}
                onChange={(e) => onMetadataChange({ ...metadata, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#588AE8] focus:border-transparent transition-all"
                placeholder="Enter page title..."
              />
            </div>
          )}

          {/* Priority (Bug Report only) */}
          {reportType === REPORT_TYPES.BUG && (
            <div>
              <label htmlFor="priority" className="block text-sm text-gray-700 mb-1.5">
                Priority
              </label>
              <select
                id="priority"
                value={metadata.priority || 'Medium'}
                onChange={(e) => onMetadataChange({ ...metadata, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#588AE8] focus:border-transparent transition-all"
              >
                {Object.values(PRIORITY_LEVELS).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          )}

          {/* Browser and Device (Bug Report only, read-only) */}
          {reportType === REPORT_TYPES.BUG && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Browser
                </label>
                <input
                  type="text"
                  value={metadata.browser || ''}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Device
                </label>
                <input
                  type="text"
                  value={metadata.device || ''}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              value={metadata.description || ''}
              onChange={(e) => onMetadataChange({ ...metadata, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#588AE8] focus:border-transparent transition-all resize-none"
              placeholder={reportType === REPORT_TYPES.BUG ? "Users are unable to complete the login process..." : "Enter page description..."}
            />
          </div>

          {/* Steps to Reproduce (Bug Report only) */}
          {reportType === REPORT_TYPES.BUG && (
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Steps to Reproduce
              </label>
              <div className="space-y-2">
                {(metadata.stepsToReproduce || []).length > 0 && (
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {metadata.stepsToReproduce.map((step, index) => (
                      <li key={index} className="flex items-start justify-between gap-2">
                        <span className="flex-1">{step}</span>
                        <button
                          onClick={() => handleRemoveStep(index)}
                          className="hover:bg-red-100 rounded-full p-1 transition-colors flex-shrink-0"
                          aria-label={`Remove step ${index + 1}`}
                        >
                          <XIcon className="w-3 h-3 text-red-600" />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    onKeyDown={handleStepKeyDown}
                    className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#588AE8] focus:border-transparent transition-all text-sm"
                    placeholder="Add a step..."
                  />
                  <button
                    onClick={handleAddStep}
                    disabled={!newStep.trim()}
                    className="px-3 py-2 rounded-lg text-sm text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    style={{ backgroundColor: '#588AE8' }}
                    onMouseOver={(e) => !newStep.trim() ? null : e.currentTarget.style.backgroundColor = '#3d6290'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#588AE8'}
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tags (General Report only) */}
          {reportType === REPORT_TYPES.GENERAL && (
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">
                Tags
              </label>
            <div className="space-y-2">
              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white"
                      style={{ backgroundColor: '#5a5387' }}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#588AE8] focus:border-transparent transition-all text-sm"
                  placeholder="Add a tag..."
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="px-3 py-2 rounded-lg text-sm text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  style={{ backgroundColor: '#588AE8' }}
                  onMouseOver={(e) => !newTag.trim() ? null : e.currentTarget.style.backgroundColor = '#3d6290'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#588AE8'}
                >
                  <PlusIcon className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm text-gray-700 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                id="date"
                type="date"
                value={metadata.date}
                onChange={(e) => onMetadataChange({ ...metadata, date: e.target.value })}
                className="w-full px-3.5 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#588AE8] focus:border-transparent transition-all"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Image Layout Section */}
      <section>
        <h2 className="text-lg text-gray-900 mb-3">Image Layout</h2>
        <div className="grid grid-cols-2 gap-2">
          {layoutOptions.map(({ type, icon: Icon, label, description }) => (
            <button
              key={type}
              onClick={() => onLayoutSettingsChange({ ...layoutSettings, layout: type })}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                layoutSettings.layout === type
                  ? 'border-[#588AE8] bg-[#588AE8]/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Icon
                className={`w-7 h-7 ${
                  layoutSettings.layout === type ? 'text-[#588AE8]' : 'text-gray-500'
                }`}
              />
              <div className="text-center">
                <div className={`text-sm ${
                  layoutSettings.layout === type ? 'text-[#588AE8]' : 'text-gray-900'
                }`}>
                  {label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Spacing Section */}
      <section>
        <h2 className="text-lg text-gray-900 mb-3">Spacing</h2>
        <div className="flex gap-2">
          {spacingOptions.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onLayoutSettingsChange({ ...layoutSettings, spacing: type })}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm transition-all ${
                layoutSettings.spacing === type
                  ? 'bg-[#588AE8] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* Background Color Section */}
      <section>
        <h2 className="text-lg text-gray-900 mb-3">Background</h2>
        <div className="flex gap-3">
          {backgroundOptions.map(({ type, color, label }) => (
            <button
              key={type}
              onClick={() => onLayoutSettingsChange({ ...layoutSettings, background: type })}
              className="flex-1 relative group"
              title={label}
            >
              <div
                className={`w-full h-16 rounded-lg border-2 transition-all ${
                  layoutSettings.background === type
                    ? 'border-[#588AE8] shadow-lg scale-105'
                    : 'border-gray-300 hover:border-gray-400 hover:scale-102'
                }`}
                style={{ background: color }}
              >
                {layoutSettings.background === type && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#588AE8] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1.5 text-center">{label}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

