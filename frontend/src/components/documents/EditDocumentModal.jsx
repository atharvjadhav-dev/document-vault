import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { CATEGORIES } from '../../utils/helpers';

const EditDocumentModal = ({ document, onSave, onClose }) => {
  const [filename, setFilename] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (document) {
      setFilename(document.original_filename || '');
      setCategory(document.category || 'Other');
    }
  }, [document]);

  const handleSave = async () => {
    if (!filename.trim()) {
      setError('Filename cannot be empty.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave(document.id, { originalFilename: filename.trim(), category });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={!!document} onClose={onClose} title="Edit Document" size="md">
      <div className="space-y-4">
        <Input
          label="Filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          error={error}
          placeholder="Enter filename"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} loading={loading}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditDocumentModal;
