import { CONFIG } from 'src/config-global';

import { CreateDatabaseView } from 'src/sections/database/view/create-database-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Create Database - ${CONFIG.appName}`}</title>

      <CreateDatabaseView />
    </>
  );
}