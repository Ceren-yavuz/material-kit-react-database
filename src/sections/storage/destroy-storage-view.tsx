import type { MinioStorage } from 'src/types/minioTypes';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import minioService from 'src/services/minioService';

// ----------------------------------------------------------------------

type DestroyStorageViewProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storage: MinioStorage;
};

export function DestroyStorageView({ 
  open, 
  onClose, 
  onSuccess, 
  storage 
}: DestroyStorageViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDestroy = async () => {
    try {
      setLoading(true);
      setError(null);

      const deleteInput = {
        uuid: storage.uuid,
        deletedBy: 'ahmet',
      };

      const result = await minioService.deleteMinioStorage(deleteInput);
      
      if (result.ids && result.ids.length > 0) {
        onSuccess();
      } else {
        setError('Storage destruction failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while destroying storage');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Destroy Storage</DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to destroy this MinIO storage instance?
        </Typography>
        
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Storage Details:
          </Typography>
          
          <Typography variant="body2">
            <strong>Remote IP:</strong> {storage.remote_ip}
          </Typography>
          <Typography variant="body2">
            <strong>SSH User:</strong> {storage.ssh_user}
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> {storage.status}
          </Typography>
        </Box>
        
        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>Warning:</strong> This action cannot be undone. All data stored in this MinIO instance will be permanently deleted.
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDestroy}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Destroying...' : 'Destroy Storage'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}