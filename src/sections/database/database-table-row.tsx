import type { MongoDatabase } from 'src/types/mongotypes';
import type { UnifiedDatabase } from 'src/types/databaseTypes';

import { useState, useCallback } from 'react';

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

// ----------------------------------------------------------------------

export type DatabaseProps = UnifiedDatabase;

type DatabaseTableRowProps = {
  row: DatabaseProps;
  selected: boolean;
  onSelectRow: () => void;
};

export function DatabaseTableRow({ row, selected, onSelectRow }: DatabaseTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Utility functions for status display
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
      case 'completed':
      case 'active':
        return 'success';
      case 'failed':
      case 'error':
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
        return 'Başarılı';
      case 'completed':
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'provisioning':
        return 'Hazırlanıyor';
      case 'in_progress':
        return 'İşleniyor';
      case 'deleting':
        return 'Siliniyor';
      case 'terminating':
        return 'Sonlandırılıyor';
      default:
        return status || 'Bilinmiyor';
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
            label={row.type === DatabaseType.MONGODB ? 'MongoDB' : 'PostgreSQL'}
            color={row.type === DatabaseType.MONGODB ? 'success' : 'primary'}
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
          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="solar:eye-bold" />
            View Details
          </MenuItem>

          <MenuItem onClick={handleClosePopover}>
            <Iconify icon="solar:cart-3-bold" />
            Clone
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