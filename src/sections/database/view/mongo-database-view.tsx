import type { MongoDatabase } from 'src/types/mongotypes';
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

import { DatabaseTableRow } from '../database-table-row';
import { DatabaseTableHead } from '../database-table-head';

// ----------------------------------------------------------------------

export function MongoDatabaseView() {
  const navigate = useNavigate();
  const table = useTable();
  const [databases, setDatabases] = useState<UnifiedDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  // Destroy DB notification tetikleyici
  const handleNotifyDestroy = () => {
    setNotification('The selected database is being destroyed.');
    setTimeout(() => setNotification(null), 3000);
  };
  const [connectionStatus, setConnectionStatus] = useState<{
    mongo: boolean;
  }>({ mongo: false });

  // Fetch all databases from both services
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test both backend connections
        const status = await unifiedDatabaseService.testAllConnections();
        setConnectionStatus(status);
        
        if (!status.mongo) {
          throw new Error('Unable to connect to the MongoDB service. Please ensure that the MongoDB backend is running.');
        }
        
        const data = await unifiedDatabaseService.getAllDatabases();
        // Filter only MongoDB databases
        const mongoOnlyDatabases = data.combined.filter(db => db.type === 'mongodb');
        setDatabases(mongoOnlyDatabases);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading databases');
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
        
        // Test both backend connections
        const status = await unifiedDatabaseService.testAllConnections();
        setConnectionStatus(status);
        
        if (!status.mongo) {
          throw new Error('Unable to connect to the MongoDB service. Please ensure that the MongoDB backend is running.');
        }
        
        const data = await unifiedDatabaseService.getAllDatabases();
        // Filter only MongoDB databases
        const mongoOnlyDatabases = data.combined.filter(db => db.type === 'mongodb');
        setDatabases(mongoOnlyDatabases);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading databases');
        console.error('Error fetching databases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  };



  return (
    <DashboardContent>
      {notification && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {notification}
        </Alert>
      )}
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          MongoDB Databases
        </Typography>
        
        {/* Service Status Indicators */}
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Chip
            label="MongoDB"
            color={connectionStatus.mongo ? 'success' : 'error'}
            size="small"
            variant={connectionStatus.mongo ? 'filled' : 'outlined'}
          />
        </Box>
        
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
                      databases.map((database) => database.id)
                    )
                  }
                  headLabel={[
                    { id: 'type', label: 'Type' },
                    { id: 'name', label: 'Name' },
                    { id: 'mongoEdition', label: 'Edition/Version' },
                    { id: 'remoteUser', label: 'User' },
                    { id: 'remoteIp', label: 'Host/IP' },
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
        </>
      )}
      
    </DashboardContent>
  );
}
