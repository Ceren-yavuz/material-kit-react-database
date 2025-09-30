import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { MongoDatabaseView } from './view/mongo-database-view';
import { MysqlDatabaseView } from './view/mysql-database-view';

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
      id={`database-tabpanel-${index}`}
      aria-labelledby={`database-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `database-tab-${index}`,
    'aria-controls': `database-tabpanel-${index}`,
  };
}

// ----------------------------------------------------------------------

export function DatabaseView() {
  const [value, setValue] = useState(0);

  const handleChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Databases
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="veritabanı türleri">
            <Tab label="MongoDB" {...a11yProps(0)} />
            <Tab label="MySQL" {...a11yProps(1)} />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <MongoDatabaseView />
        </TabPanel>

        <TabPanel value={value} index={1}>
          <MysqlDatabaseView onCreateNew={() => console.log('Create MySQL DB')} />
        </TabPanel>
      </Card>
    </Container>
  );
}