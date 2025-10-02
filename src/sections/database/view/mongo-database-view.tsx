import type { MongoDatabase } from 'src/types/mongotypes';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import mongoService from 'src/services/mongoService';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { DatabaseTableRow } from '../database-table-row';
import { DatabaseTableHead } from '../database-table-head';

// ----------------------------------------------------------------------

export function MongoDatabaseView() {
  const navigate = useNavigate();
  const table = useTable();
  const [databases, setDatabases] = useState<MongoDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch MongoDB operations on component mount
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test backend connectivity first
        const isConnected = await mongoService.testConnection();
        if (!isConnected) {
          throw new Error('Backend servisine bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
        }
        
        const data = await mongoService.getAllMongoOperations();
        setDatabases(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Veritabanları yüklenirken bir hata oluştu');
        console.error('Error fetching databases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  const handleRefresh = () => {
    const fetchDatabases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test backend connectivity first
        const isConnected = await mongoService.testConnection();
        if (!isConnected) {
          throw new Error('Backend servisine bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
        }
        
        const data = await mongoService.getAllMongoOperations();
        setDatabases(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Veritabanları yüklenirken bir hata oluştu');
        console.error('Error fetching databases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  };



  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Database
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/database/create', { state: { defaultType: 'mongodb' } })}
        >
          New MongoDB Database
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="solar:restart-bold" />}
          onClick={handleRefresh}
          sx={{ ml: 1 }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <DatabaseTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={databases.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      databases.map((database) => database.uuid)
                    )
                  }
                  headLabel={[
                    { id: 'mongoEdition', label: 'Edition' },
                    { id: 'mongoVersion', label: 'Version' },
                    { id: 'remoteUser', label: 'Remote User' },
                    { id: 'remoteIp', label: 'Remote IP' },
                    { id: 'status', label: 'Status' },
                    { id: 'createdAt', label: 'Created At' },
                    { id: 'createdBy', label: 'Created By' },
                    { id: 'isDeleted', label: 'Is Deleted' },
                    { id: 'deletedAt', label: 'Deleted At' },
                    { id: 'updatedBy', label: 'Updated By' },
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {databases
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <DatabaseTableRow
                        key={row.uuid}
                        row={row}
                        selected={table.selected.includes(row.uuid)}
                        onSelectRow={() => table.onSelectRow(row.uuid)}
                      />
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            component="div"
            page={table.page}
            count={databases.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </>
      )}
      
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
