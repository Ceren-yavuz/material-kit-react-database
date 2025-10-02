import type { MysqlDatabase } from 'src/types/mysqltypes';

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

import mysqlService from 'src/services/mysqlService';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTable } from 'src/hooks/use-table';

import { MysqlDatabaseTableRow, MysqlDatabaseTableHead } from 'src/sections/database';

// ----------------------------------------------------------------------

interface MysqlDatabaseViewProps {
  onCreateNew?: () => void;
}

export function MysqlDatabaseView({ onCreateNew }: MysqlDatabaseViewProps) {
  const navigate = useNavigate();
  const table = useTable();
  const [databases, setDatabases] = useState<MysqlDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch MySQL operations on component mount
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        console.log('MySQL: Starting to fetch databases...');
        setLoading(true);
        setError(null);
        
        // Test backend connectivity first
        console.log('MySQL: Testing backend connection...');
        const isConnected = await mysqlService.testConnection();
        console.log('MySQL: Connection test result:', isConnected);
        
        if (!isConnected) {
          throw new Error('MySQL backend servisine bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
        }
        
        console.log('MySQL: Fetching all MySQL operations...');
        const data = await mysqlService.getAllMysqlOperations();
        console.log('MySQL: Received data:', data);
        setDatabases(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'MySQL veritabanları yüklenirken bir hata oluştu');
        console.error('Error fetching MySQL databases:', err);
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
        const isConnected = await mysqlService.testConnection();
        if (!isConnected) {
          throw new Error('MySQL backend servisine bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
        }
        
        const data = await mysqlService.getAllMysqlOperations();
        setDatabases(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'MySQL veritabanları yüklenirken bir hata oluştu');
        console.error('Error fetching MySQL databases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  };

  return (
    <>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          MySQL Databases
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/database/create', { state: { defaultType: 'mysql' } })}
        >
          New MySQL Database
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
                <MysqlDatabaseTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={databases.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  checked={table.selected.length > 0 && table.selected.length === databases.length}
                  onSelectAllRows={(checked: boolean) =>
                    table.onSelectAllRows(
                      checked,
                      databases.map((database) => database.uuid)
                    )
                  }
                  headLabel={[
                    { id: 'mysqlEdition', label: 'Edition' },
                    { id: 'mysqlVersion', label: 'Version' },
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
                      <MysqlDatabaseTableRow
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
    </>
  );
}