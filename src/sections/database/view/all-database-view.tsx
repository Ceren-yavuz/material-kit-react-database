import type { UnifiedDatabase } from 'src/types/databaseTypes';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTable } from 'src/hooks/use-table';

import { DatabaseTableRow } from '../database-table-row';
import { DatabaseTableHead } from '../database-table-head';
import unifiedDatabaseService, { DatabaseType } from 'src/services/unifiedDatabaseService';

// ----------------------------------------------------------------------

export function AllDatabaseView() {
  const navigate = useNavigate();
  const table = useTable();
  const [databases, setDatabases] = useState<UnifiedDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    mongo: boolean;
    postgres: boolean;
    mysql: boolean;
  }>({ mongo: false, postgres: false, mysql: false });
  // Destroy DB notification tetikleyici
  const handleNotifyDestroy = () => {
    setNotification('The selected database is being destroyed.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch all databases from all services
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test all backend connections
        const status = await unifiedDatabaseService.testAllConnections();
        setConnectionStatus(status);
        
        if (!status.mongo && !status.postgres && !status.mysql) {
          throw new Error('Hiçbir backend servisine bağlanılamıyor. Lütfen backend\'lerin çalıştığından emin olun.');
        }
        
        const data = await unifiedDatabaseService.getAllDatabases();
        // Sort by createdAt descending (newest first)
        const sortedDatabases = data.combined.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order
        });
        setDatabases(sortedDatabases);
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
        
        // Test all backend connections
        const status = await unifiedDatabaseService.testAllConnections();
        setConnectionStatus(status);
        
        if (!status.mongo && !status.postgres && !status.mysql) {
          throw new Error('Hiçbir backend servisine bağlanılamıyor. Lütfen backend\'lerin çalıştığından emin olun.');
        }
        
        const data = await unifiedDatabaseService.getAllDatabases();
        // Sort by createdAt descending (newest first)
        const sortedDatabases = data.combined.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order
        });
        setDatabases(sortedDatabases);
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
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          All Databases
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate('/database/create')}
        >
          New Database
        </Button>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:restart-bold" />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{ ml: 1 }}
        >
          Refresh
        </Button>
      </Box>

      {notification && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {notification}
        </Alert>
      )}
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
                  onSelectAllRows={(checked) =>
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