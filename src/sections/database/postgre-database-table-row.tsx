import type { PostgreDatabase } from 'src/types/postgretypes';

import { useState, useCallback } from 'react';

import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
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
      handleClosePopover();
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
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

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
          <MenuItem onClick={handleDestroyDb} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Destroy DB
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}