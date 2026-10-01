import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { HistoryItem, RiskLevelColors } from '../types';
import { Modal } from './Modal';

interface HistoryTableProps {
  history: HistoryItem[];
  onView: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const HistoryTable = ({ history, onView, onDelete, isLoading }: HistoryTableProps) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      {history.length === 0 ? (
        <Card variant="subtle" padding="lg" className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 mb-4 bg-soft-accent rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📜</span>
            </div>
            <h3 className="text-xl font-semibold text-primary-text mb-2">
              No History Yet
            </h3>
            <p className="text-secondary-text">
              Your scan history will appear here
            </p>
          </motion.div>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className="space-y-4"
        >
          {history.map((item, index) => {
            const colors = RiskLevelColors[item.riskLevel];
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card
                  variant="bordered"
                  padding="md"
                  className={`border-l-4 ${colors.border.replace('border-', 'border-l-')}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {item.scanType === 'message' ? '💬' : 
                           item.scanType === 'url' ? '🔗' : '📷'}
                        </span>
                        <div>
                          <h4 className="font-semibold text-primary-text">
                            {item.preview}
                          </h4>
                          <p className="text-xs text-secondary-text/60">
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="risk" riskLevel={item.riskLevel}>
                        {item.riskLevel}
                      </Badge>
                      <span className="text-sm text-secondary-text/60">
                        Score: {item.riskScore}
                      </span>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(item)}
                          className="text-primary-accent hover:text-primary-accent/80"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item.id)}
                          className="text-danger hover:text-danger/80"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
        size="sm"
      >
        <p className="text-secondary-text">
          Are you sure you want to delete this scan from your history?
          This action cannot be undone.
        </p>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirmId(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default HistoryTable;
