import type { UnifiedDatabase } from 'src/types/databaseTypes';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useTable } from 'src/hooks/use-table';

import { DashboardContent } from 'src/layouts/dashboard';
import unifiedDatabaseService, { DatabaseType } from 'src/services/unifiedDatabaseService';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { DatabaseTableRow, DatabaseTableHead } from 'src/sections/database';

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
  const [connectionStatus, setConnectionStatus] = useState<{
    postgres: boolean;
  }>({ postgres: false });

  // Fetch PostgreSQL operations on component mount
  const fetchDatabases = async () => {
    try {
      console.log('PostgreSQL: Starting to fetch databases...');
      setLoading(true);
      setError(null);
      
      // Test backend connectivity first
      console.log('PostgreSQL: Testing backend connection...');
      const connectionStatusResult = await unifiedDatabaseService.testAllConnections();
      console.log('PostgreSQL: Connection test result:', connectionStatusResult);
      setConnectionStatus({ postgres: connectionStatusResult.postgres });
      
      if (!connectionStatusResult.postgres) {
        throw new Error('Unable to connect to the PostgreSQL backend service. Please ensure the backend is running.');
      }
      
      const allDatabases = await unifiedDatabaseService.getAllDatabases();
      const data = allDatabases.combined.filter(db => db.type === DatabaseType.POSTGRESQL);
      // Sort by createdAt descending (newest first)
      const sortedDatabases = data.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order
      });
      console.log('PostgreSQL: Fetched databases:', sortedDatabases);
      setDatabases(sortedDatabases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching PostgreSQL databases');
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

  const handleNotifyDestroy = useCallback(() => {
    fetchDatabases(); // Refresh the list after a destroy operation
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
          PostgreSQL Databases
        </Typography>
        
        {/* Service Status Indicators */}
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Chip
            label="PostgreSQL"
            color={connectionStatus.postgres ? 'success' : 'error'}
            size="small"
            variant={connectionStatus.postgres ? 'filled' : 'outlined'}
          />
        </Box>
        
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
        <Box sx={{ height: '100%' }}>
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
                    { id: 'type', label: 'Type' },
                    { id: 'name', label: 'Name' },
                    { id: 'version', label: 'Version' },
                    { id: 'user', label: 'User' },
                    { id: 'host', label: 'Host/IP' },
                    { id: 'port', label: 'Port' },
                    { id: 'status', label: 'Status' },
                    { id: 'createdAt', label: 'Created' },
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
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onNotifyDestroy={handleNotifyDestroy}
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
        </Box>
      )}
    </DashboardContent>
  );
}