import type { MinioStorage } from 'src/types/minioTypes';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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

import minioService from 'src/services/minioService';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { StorageTableRow } from '../storage-table-row';
import { StorageTableHead } from '../storage-table-head';

// ----------------------------------------------------------------------

export function MinioStorageView() {
  const navigate = useNavigate();
  const table = useTable();
  const [storages, setStorages] = useState<MinioStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Destroy storage notification handler
  const handleNotifyDestroy = () => {
    setNotification('The selected MinIO storage is being destroyed.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch MinIO storages
  useEffect(() => {
    const fetchStorages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test MinIO backend connection
        const status = await minioService.testConnection();
        setIsConnected(status);
        
        if (!status) {
          throw new Error('MinIO backend servisine bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
        }
        
        const data = await minioService.getAllMinioStorages();
        // Sort by createdAt descending (newest first)
        const sortedStorages = data.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order
        });
        setStorages(sortedStorages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'MinIO storage\'ları yüklenirken bir hata oluştu');
        console.error('Error fetching MinIO storages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorages();
  }, []);

  const handleRefresh = () => {
    const fetchStorages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test MinIO backend connection
        const status = await minioService.testConnection();
        setIsConnected(status);
        
        if (!status) {
          throw new Error('MinIO backend servisine bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.');
        }
        
        const data = await minioService.getAllMinioStorages();
        // Sort by createdAt descending (newest first)
        const sortedStorages = data.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order
        });
        setStorages(sortedStorages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'MinIO storage\'ları yüklenirken bir hata oluştu');
        console.error('Error fetching MinIO storages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorages();
  };

  const handleCreateNew = () => {
    navigate('/storage/create?type=minio');
  };

  const dataFiltered = storages;

  return (
    <DashboardContent>
      {notification && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {notification}
        </Alert>
      )}

      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          MinIO Storage ({storages.length})
        </Typography>
        
        <Box display="flex" gap={1} alignItems="center">
          {/* Backend Status Indicator */}
          <Chip
            size="small"
            label="MinIO Service"
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
          />
          
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleCreateNew}
            disabled={!isConnected}
          >
            New MinIO Storage
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Card>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <StorageTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={storages.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      storages.map((storage) => storage.uuid)
                    )
                  }
                  headLabel={[
                    { id: 'uuid', label: 'Storage ID' },
                    { id: 'type', label: 'Type' },
                    { id: 'remote_ip', label: 'Remote IP' },
                    { id: 'ssh_user', label: 'SSH User' },
                    { id: 'status', label: 'Status' },
                    { id: 'use_edb', label: 'EDB' },
                    { id: 'osVersion', label: 'OS Version' },
                    { id: 'createdBy', label: 'Created By' },
                    { id: 'createdAt', label: 'Created At' },
                    { id: '', label: '' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((storage) => (
                      <StorageTableRow
                        key={storage.uuid}
                        row={storage}
                        selected={table.selected.includes(storage.uuid)}
                        onSelectRow={() => table.onSelectRow(storage.uuid)}
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
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}
    </DashboardContent>
  );
}