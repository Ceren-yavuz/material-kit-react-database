import type { PostgreDatabase } from 'src/types/postgretypes';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { postgresService } from 'src/services/postgresService';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type PostgreDatabaseProps = PostgreDatabase;

type PostgreDatabaseTableRowProps = {
  row: PostgreDatabaseProps;
  selected: boolean;
  onSelectRow: () => void;
  onNotifyDestroy?: () => void;
};

export function PostgreDatabaseTableRow({ row, selected, onSelectRow, onNotifyDestroy }: PostgreDatabaseTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Destroy DB confirmation handler
  const handleShowDestroyConfirm = () => {
    setOpenConfirmDialog(true);
    handleClosePopover();
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };
  
  // Destroy DB işlemi
  const handleDestroyDb = async () => {
    if (typeof onNotifyDestroy === 'function') {
      onNotifyDestroy();
    }
    setLoading(true);
    setError(null);
    try {
      console.log('PostgreSQL: Starting delete operation for UUID:', row.uuid);
      await postgresService.removePostgreOperation({ uuid: row.uuid });
      console.log('PostgreSQL: Delete operation successful');
      setSuccess(true);
    } catch (err) {
      console.error('PostgreSQL: Delete operation failed:', err);
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu');
    } finally {
      setLoading(false);
      setOpenConfirmDialog(false);
    }
  };

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>

        <TableCell>{row.postgreEdition}</TableCell>

        <TableCell>{row.postgreVersion}</TableCell>

        <TableCell>{row.remoteUser}</TableCell>

        <TableCell>{row.remoteIp}</TableCell>

        <TableCell>
          <Label color={postgresService.getStatusColor(row.status)}>
            {row.status}
          </Label>
        </TableCell>

        <TableCell>{new Date(row.createdAt).toLocaleDateString('tr-TR')}</TableCell>

        <TableCell>{row.createdBy}</TableCell>

        <TableCell>
          <Label color={row.isDeleted ? 'error' : 'success'}>
            {row.isDeleted ? 'Deleted' : 'Active'}
          </Label>
        </TableCell>

        <TableCell>{row.deletedAt ? new Date(row.deletedAt).toLocaleDateString('tr-TR') : '-'}</TableCell>

        <TableCell>{row.updatedBy}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleShowDestroyConfirm} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Destroy DB
          </MenuItem>
        </MenuList>
      </Popover>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="destroy-confirm-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="destroy-confirm-dialog-title">
          Confirm Database Destruction
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to destroy this PostgreSQL database?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Database Details:
            </Typography>
            <Typography variant="body2"><strong>Edition:</strong> {row.postgreEdition}</Typography>
            <Typography variant="body2"><strong>Version:</strong> {row.postgreVersion}</Typography>
            <Typography variant="body2"><strong>Host/IP:</strong> {row.remoteIp}</Typography>
            <Typography variant="body2"><strong>User:</strong> {row.remoteUser}</Typography>
            <Typography variant="body2"><strong>Status:</strong> {row.status}</Typography>
            <Typography variant="body2"><strong>Created By:</strong> {row.createdBy}</Typography>
            <Typography variant="body2"><strong>Created At:</strong> {new Date(row.createdAt).toLocaleDateString('tr-TR')}</Typography>
          </Box>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            <strong>Warning:</strong> This action cannot be undone. All data will be permanently lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDestroyDb} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Destroying...' : 'Destroy DB'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}