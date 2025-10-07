import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { AllStorageView } from './view/all-storage-view';
import { MinioStorageView } from './view/minio-storage-view';

// ----------------------------------------------------------------------

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`storage-tabpanel-${index}`}
      aria-labelledby={`storage-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `storage-tab-${index}`,
    'aria-controls': `storage-tabpanel-${index}`,
  };
}

// ----------------------------------------------------------------------

type StorageType = 'minio' | '';

export function StorageView() {
  const location = useLocation();
  const [value, setValue] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState<StorageType>(() => {
    if (location.state && location.state.defaultType === 'minio') {
      return 'minio';
    }
    return '';
  });

  // Change tab based on ?type=all or ?type=minio
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'all') setValue(0);
    else if (type === 'minio') setValue(1);
  }, [location.search]);

  const handleChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Storage
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="storage türleri">
            <Tab label="All Storage" {...a11yProps(0)} />
            <Tab label="MinIO" {...a11yProps(1)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <AllStorageView />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <MinioStorageView />
        </TabPanel>
      </Card>
    </Container>
  );
}