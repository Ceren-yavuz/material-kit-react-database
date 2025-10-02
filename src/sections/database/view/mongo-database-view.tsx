import type { MongoDatabase } from 'src/types/mongotypes';
import type { PostgresDatabase } from 'src/services/postgresService';
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

export function MongoDatabaseView() {
  const navigate = useNavigate();
  const table = useTable();
  const [databases, setDatabases] = useState<UnifiedDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    mongo: boolean;
    postgres: boolean;
  }>({ mongo: false, postgres: false });

  // Fetch all databases from both services
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test both backend connections
        const status = await unifiedDatabaseService.testAllConnections();
        setConnectionStatus(status);
        
        if (!status.mongo && !status.postgres) {
          throw new Error('Hiçbir backend servisine bağlanılamıyor. Lütfen backend\'lerin çalıştığından emin olun.');
        }
        
        const data = await unifiedDatabaseService.getAllDatabases();
        setDatabases(data.combined);
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
        
        // Test both backend connections
        const status = await unifiedDatabaseService.testAllConnections();
        setConnectionStatus(status);
        
        if (!status.mongo && !status.postgres) {
          throw new Error('Hiçbir backend servisine bağlanılamıyor. Lütfen backend\'lerin çalıştığından emin olun.');
        }
        
        const data = await unifiedDatabaseService.getAllDatabases();
        setDatabases(data.combined);
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
        
        {/* Service Status Indicators */}
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Chip
            label="MongoDB"
            color={connectionStatus.mongo ? 'success' : 'error'}
            size="small"
            variant={connectionStatus.mongo ? 'filled' : 'outlined'}
          />
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
