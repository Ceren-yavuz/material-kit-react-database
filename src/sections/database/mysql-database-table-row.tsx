import type { MysqlDatabase } from 'src/types/mysqltypes';

import { useState, useCallback } from 'react';

import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import mysqlService from 'src/services/mysqlService';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type MysqlDatabaseProps = MysqlDatabase;

type MysqlDatabaseTableRowProps = {
  row: MysqlDatabaseProps;
  selected: boolean;
  onSelectRow: () => void;
  onNotifyDestroy?: () => void;
};

  export function MysqlDatabaseTableRow({ row, selected, onSelectRow, onNotifyDestroy }: MysqlDatabaseTableRowProps) {
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
      await mysqlService.removeMysqlOperation({ uuid: row.uuid });
      setSuccess(true);
    } catch (err) {
      setError('Silme işlemi başarısız oldu');
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

        <TableCell>{row.mysqlEdition}</TableCell>

        <TableCell>{row.mysqlVersion}</TableCell>

        <TableCell>{row.remoteUser}</TableCell>

        <TableCell>{row.remoteIp}</TableCell>

        <TableCell>
          <Label color={mysqlService.getStatusColor(row.status)}>
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

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}