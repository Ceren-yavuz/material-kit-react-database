import type { MinioStorage } from 'src/types/minioTypes';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { DestroyStorageView } from './destroy-storage-view';

// ----------------------------------------------------------------------

export type StorageProps = MinioStorage;

type StorageTableRowProps = {
  row: StorageProps;
  selected: boolean;
  onSelectRow: () => void;
  onNotifyDestroy?: () => void;
};

export function StorageTableRow({ row, selected, onSelectRow, onNotifyDestroy }: StorageTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDestroy, setOpenDestroy] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleOpenDestroy = useCallback(() => {
    setOpenDestroy(true);
    handleClosePopover();
  }, [handleClosePopover]);

  const handleCloseDestroy = useCallback(() => {
    setOpenDestroy(false);
  }, []);

  const handleDestroySuccess = useCallback(() => {
    handleCloseDestroy();
    onNotifyDestroy?.();
  }, [handleCloseDestroy, onNotifyDestroy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'PROVISIONING':
        return 'info';
      case 'FAILED':
        return 'error';
      case 'DELETING':
        return 'warning';
      case 'DELETED':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Identifier column removed; rely on explicit columns

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell>
          <Chip label="MinIO" color="primary" size="small" />
        </TableCell>

        <TableCell>{row.remote_ip}</TableCell>

        <TableCell>{row.ssh_user}</TableCell>

        <TableCell>
          <Label color={getStatusColor(row.status)}>
            {row.status}
          </Label>
        </TableCell>

        <TableCell>
          <Chip 
            label={row.use_edb ? 'Yes' : 'No'} 
            color={row.use_edb ? 'success' : 'default'} 
            size="small" 
            variant="outlined"
          />
        </TableCell>

        <TableCell>{row.osVersion || 'N/A'}</TableCell>

        <TableCell>{row.createdBy}</TableCell>

        <TableCell>{formatDate(row.createdAt)}</TableCell>

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
          <MenuItem onClick={handleOpenDestroy} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      <DestroyStorageView
        open={openDestroy}
        onClose={handleCloseDestroy}
        onSuccess={handleDestroySuccess}
        storage={row}
      />
    </>
  );
}