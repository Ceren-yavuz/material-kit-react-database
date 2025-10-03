import type { MongoDatabase } from 'src/types/mongotypes';
import type { UnifiedDatabase } from 'src/types/databaseTypes';

import React, { useState, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuList from '@mui/material/MenuList';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DatabaseType } from 'src/services/unifiedDatabaseService';
import mongoService from 'src/services/mongoService';

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

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Destroy DB işlemi
  const handleDestroyDb = async () => {
    if (typeof onNotifyDestroy === 'function') {
      onNotifyDestroy();
    }
    try {
      setLoading(true);
      await mongoService.removeMongoOperation({ uuid: row.uuid || row.id });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database could not be destroyed');
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
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

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
          <MenuItem onClick={handleDestroyDb} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Destroy DB
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}