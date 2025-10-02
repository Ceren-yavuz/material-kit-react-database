import type { UnifiedDatabase } from 'src/types/databaseTypes';

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

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTable } from 'src/hooks/use-table';

import { DatabaseTableRow, DatabaseTableHead } from 'src/sections/database';
import unifiedDatabaseService, { DatabaseType } from 'src/services/unifiedDatabaseService';

// ----------------------------------------------------------------------

interface PostgreDatabaseViewProps {
  // onCreateNew prop'u kaldırıldı, navigate kullanıyoruz
}

export function PostgreDatabaseView() {
  const navigate = useNavigate();
  const table = useTable();
  const [databases, setDatabases] = useState<UnifiedDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch PostgreSQL operations on component mount
  const fetchDatabases = async () => {
    try {
      console.log('PostgreSQL: Starting to fetch databases...');
      setLoading(true);
      setError(null);
      
      // Test backend connectivity first
      console.log('PostgreSQL: Testing backend connection...');
      const connectionStatus = await unifiedDatabaseService.testAllConnections();
      console.log('PostgreSQL: Connection test result:', connectionStatus);
      
      if (!connectionStatus.postgres) {
        throw new Error('PostgreSQL backend servisine bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
      }
      
      const allDatabases = await unifiedDatabaseService.getAllDatabases();
      const data = allDatabases.combined.filter(db => db.type === DatabaseType.POSTGRESQL);
      console.log('PostgreSQL: Fetched databases:', data);
      setDatabases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PostgreSQL veritabanları yüklenirken bir hata oluştu');
      console.error('PostgreSQL: Error fetching databases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDatabases();
  }, []);

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
          PostgreSQL Database
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/database/create?type=postgresql')}
        >
          New PostgreSQL Database
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
                  onSelectAllRows={(checked: boolean) =>
                    table.onSelectAllRows(
                      checked,
                      databases.map((database) => database.id)
                    )
                  }
                  headLabel={[
                    { id: 'name', label: 'Database' },
                    { id: 'status', label: 'Status' },
                    { id: 'remote_ip', label: 'Remote IP' },
                    { id: 'dbVersion', label: 'Version' },
                    { id: 'createdAt', label: 'Created' },
                    { id: 'createdBy', label: 'Created By' },
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
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
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