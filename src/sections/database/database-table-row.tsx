import type { MongoDatabase } from 'src/types/mongotypes';
import type { UnifiedDatabase } from 'src/types/databaseTypes';

import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import mongoService from 'src/services/mongoService';
import mysqlService from 'src/services/mysqlService';
import { postgresService } from 'src/services/postgresService';
import { DatabaseType } from 'src/services/unifiedDatabaseService';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type DatabaseProps = UnifiedDatabase;

type DatabaseTableRowProps = {
  row: DatabaseProps;
  selected: boolean;
  onSelectRow: () => void;
  onNotifyDestroy?: () => void;
};

export function DatabaseTableRow({ row, selected, onSelectRow, onNotifyDestroy }: DatabaseTableRowProps): React.ReactElement {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

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
    try {
      setLoading(true);
      
      if (row.type === DatabaseType.MONGODB) {
        await mongoService.removeMongoOperation({ uuid: row.uuid || row.id });
      } else if (row.type === DatabaseType.MYSQL) {
        await mysqlService.removeMysqlOperation({ uuid: row.uuid || row.id });
      } else if (row.type === DatabaseType.POSTGRESQL) {
        await postgresService.removePostgreOperation({ uuid: row.uuid || row.id });
      }
      
      setSuccess(true);
      setOpenConfirmDialog(false); // Dialog'u başarılı durumda kapat
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database could not be destroyed');
      setOpenConfirmDialog(false); // Dialog'u hata durumunda da kapat
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'provisioning':
      case 'in_progress':
      case 'pending':
        return 'warning';
      case 'deleting':
      case 'terminating':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
        return 'SUCCEEDED';
      case 'completed':
        return 'COMPLETED';
      case 'failed':
        return 'FAILED';
      case 'provisioning':
        return 'PROVISIONING';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'deleting':
        return 'DELETING';
      case 'terminating':
        return 'TERMINATING';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>

        {/* Database Type */}
        <TableCell>
          <Chip
            label={
              row.type === DatabaseType.MONGODB 
                ? 'MongoDB' 
                : row.type === DatabaseType.MYSQL 
                ? 'MySQL' 
                : 'PostgreSQL'
            }
            color={
              row.type === DatabaseType.MONGODB 
                ? 'success' 
                : row.type === DatabaseType.MYSQL 
                ? 'warning' 
                : 'primary'
            }
            size="small"
          />
        </TableCell>

        {/* Name */}
        <TableCell>{row.name || row.mongoEdition || '-'}</TableCell>

        {/* Edition/Version */}
        <TableCell>
          {row.type === DatabaseType.MONGODB 
            ? `${row.mongoEdition || ''} ${row.mongoVersion || ''}`.trim() || '-'
            : row.description || '-'
          }
        </TableCell>

        {/* User */}
        <TableCell>
          {row.type === DatabaseType.MONGODB ? row.remoteUser : row.username || '-'}
        </TableCell>

        {/* Host/IP */}
        <TableCell>
          {row.type === DatabaseType.MONGODB ? row.remoteIp : row.host || '-'}
        </TableCell>

        {/* Port */}
        <TableCell>{row.port || '-'}</TableCell>

        {/* Status */}
        <TableCell>
          <Label color={getStatusColor(row.status)}>
            {getStatusText(row.status)}
          </Label>
        </TableCell>

        {/* Created At */}
        <TableCell>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('tr-TR') : '-'}
        </TableCell>

        {/* Actions */}
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
            Are you sure you want to destroy this database?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Database Details:
            </Typography>
            <Typography variant="body2"><strong>Type:</strong> {row.type === DatabaseType.MONGODB ? 'MongoDB' : row.type === DatabaseType.MYSQL ? 'MySQL' : 'PostgreSQL'}</Typography>
            <Typography variant="body2"><strong>Name:</strong> {row.name || row.mongoEdition || '-'}</Typography>
            <Typography variant="body2"><strong>Version:</strong> {
              row.type === DatabaseType.MONGODB 
                ? `${row.mongoEdition || ''} ${row.mongoVersion || ''}`.trim() || '-'
                : row.description || '-'
            }</Typography>
            <Typography variant="body2"><strong>Host/IP:</strong> {row.type === DatabaseType.MONGODB ? row.remoteIp : row.host || '-'}</Typography>
            <Typography variant="body2"><strong>User:</strong> {row.type === DatabaseType.MONGODB ? row.remoteUser : row.username || '-'}</Typography>
            <Typography variant="body2"><strong>Port:</strong> {row.port || '-'}</Typography>
            <Typography variant="body2"><strong>Status:</strong> {getStatusText(row.status)}</Typography>
            <Typography variant="body2"><strong>Created:</strong> {row.createdAt ? new Date(row.createdAt).toLocaleDateString('tr-TR') : '-'}</Typography>
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