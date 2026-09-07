'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, RotateCcw, Plus, CheckCircle, AlertCircle, X } from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import FormModal, { FieldDef } from '@/components/admin/FormModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
// import { isAdminAuthenticated } from '@/lib/admin-auth';

export interface DynamicAdminManagerProps<T extends { id: string }> {
  title: string;
  subtitle: string;
  storageKey: string;
  initialData: T[];
  columns: Column<T>[];
  fields: FieldDef[];
  idPrefix?: string;
  exportFileName?: string;
  addLabel?: string;
  transformOnSave?: (values: Record<string, string>, currentItem?: T) => Partial<T>;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export default function DynamicAdminManager<T extends { id: string }>({
  title,
  subtitle,
  storageKey,
  initialData,
  columns,
  fields: defaultFields,
  idPrefix = 'item-',
  exportFileName = 'data.json',
  addLabel = 'Add Item',
  transformOnSave,
}: DynamicAdminManagerProps<T>) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  
  // Storage & Items state
  const [items, setItems] = useState<T[]>([]);
  const [dynamicFields, setDynamicFields] = useState<FieldDef[]>(defaultFields);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Custom Field Form State
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'select' | 'number'>('text');

  // Modal State
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function notify(message: string, type: 'success' | 'info' | 'error' = 'success') {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  // Sync dynamicFields when defaultFields prop changes
  useEffect(() => {
    setDynamicFields(defaultFields);
  }, [defaultFields]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems(initialData);
      }
    } catch {
      setItems(initialData);
    }
    setReady(true);
  }, [storageKey, initialData]);

  // Persist to localStorage
  const updateItems = (newItems: T[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  // Open Create
  function openCreate() {
    const emptyValues: Record<string, string> = {};
    dynamicFields.forEach((f) => {
      emptyValues[f.key] = '';
    });
    setFormValues(emptyValues);
    setEditingId(null);
    setModal('create');
  }

  // Open Edit
  function openEdit(item: T) {
    const values: Record<string, string> = {};
    const itemRecord = item as unknown as Record<string, unknown>;
    dynamicFields.forEach((f) => {
      values[f.key] = String(itemRecord[f.key] ?? '');
    });
    setFormValues(values);
    setEditingId(item.id);
    setModal('edit');
  }

  // Save (No validation required as requested)
  function handleSave() {
    let payload: Record<string, unknown> = { ...formValues };

    if (transformOnSave) {
      const currentItem = items.find((i) => i.id === editingId);
      payload = { ...payload, ...transformOnSave(formValues, currentItem) };
    }

    if (modal === 'edit' && editingId) {
      const updated = items.map((item) =>
        item.id === editingId ? ({ ...item, ...payload } as T) : item
      );
      updateItems(updated);
      notify('Item updated successfully');
    } else {
      const newItem = {
        id: `${idPrefix}${Date.now()}`,
        ...payload,
      } as T;
      updateItems([...items, newItem]);
      notify('Item created successfully');
    }

    setModal(null);
  }

  // Delete
  function handleDelete() {
    if (!deleteTarget) return;
    const filtered = items.filter((i) => i.id !== deleteTarget.id);
    updateItems(filtered);
    notify('Item deleted');
    setDeleteTarget(null);
  }

  // Reset Data to Defaults
  function handleReset() {
    if (confirm('Reset to initial default data? All custom edits will be restored.')) {
      updateItems(initialData);
      localStorage.removeItem(storageKey);
      notify('Restored default dataset', 'info');
    }
  }

  // Export JSON
  function handleExport() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${items.length} items to ${exportFileName}`);
  }

  // Import JSON
  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const formatted = parsed.map((item, idx) => ({
            id: item.id || `${idPrefix}imported-${idx}-${Date.now()}`,
            ...item,
          }));
          updateItems(formatted);
          notify(`Successfully imported ${formatted.length} items!`);
        } else {
          notify('Invalid JSON: expected an array of items', 'error');
        }
      } catch (err) {
        notify('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // Add Dynamic Custom Field
  function handleAddCustomField() {
    if (!newFieldKey.trim() || !newFieldLabel.trim()) return;
    const cleanKey = newFieldKey.trim().toLowerCase().replace(/\s+/g, '_');
    
    if (dynamicFields.some((f) => f.key === cleanKey)) {
      notify('Field with this key already exists', 'error');
      return;
    }

    const newField: FieldDef = {
      key: cleanKey,
      label: newFieldLabel.trim(),
      type: newFieldType,
    };

    setDynamicFields((prev) => [...prev, newField]);
    setNewFieldKey('');
    setNewFieldLabel('');
    setShowNewFieldModal(false);
    notify(`Dynamic field "${newField.label}" added`);
  }

  if (!ready) return null;

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          <p className="admin-page-subtitle">{subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={() => setShowNewFieldModal(true)}
            title="Add a dynamic field column to the form"
          >
            <Plus size={14} />
            Add Field
          </button>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={handleImportClick}
            title="Import items from JSON file"
          >
            <Upload size={14} />
            Import JSON
          </button>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={handleExport}
            title="Export items to JSON file"
          >
            <Download size={14} />
            Export JSON
          </button>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={handleReset}
            title="Reset to default seed data"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable<T>
        title={`${items.length} ${title.toLowerCase()}`}
        data={items}
        columns={columns}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        addLabel={addLabel}
      />

      {/* Edit / Create Form Modal */}
      {modal && (
        <FormModal
          title={modal === 'create' ? `Add ${title.slice(0, -1)}` : `Edit ${title.slice(0, -1)}`}
          fields={dynamicFields}
          values={formValues}
          onChange={(key, val) => setFormValues((prev) => ({ ...prev, [key]: val }))}
          onSubmit={handleSave}
          onClose={() => setModal(null)}
          submitLabel={modal === 'create' ? 'Create' : 'Save Changes'}
        />
      )}

      {/* Add Custom Field Modal */}
      {showNewFieldModal && (
        <div className="admin-overlay" role="dialog" onClick={() => setShowNewFieldModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Add Dynamic Form Field</span>
              <button
                className="admin-btn-icon"
                onClick={() => setShowNewFieldModal(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-field">
                <label className="admin-label">Field Label</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Subtitle, Tags, Client Name"
                  value={newFieldLabel}
                  onChange={(e) => {
                    setNewFieldLabel(e.target.value);
                    if (!newFieldKey) {
                      setNewFieldKey(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                    }
                  }}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Field Identifier (Key)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. subtitle, tags"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Field Input Type</label>
                <select
                  className="admin-select"
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                >
                  <option value="text">Text Input</option>
                  <option value="textarea">Textarea (Multiline)</option>
                  <option value="number">Number</option>
                  <option value="select">Select Box</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setShowNewFieldModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleAddCustomField}
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${title.slice(0, -1)}`}
          message={`Are you sure you want to delete this record?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 9999,
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                color: 'var(--admin-text)',
                fontSize: '0.85rem',
                animation: 'admin-slide-up 0.2s ease',
              }}
            >
              {toast.type === 'error' ? (
                <AlertCircle size={16} style={{ color: 'var(--admin-danger)' }} />
              ) : (
                <CheckCircle size={16} style={{ color: 'var(--admin-success)' }} />
              )}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
