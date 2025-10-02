import { CONFIG } from 'src/config-global';

import { DestroyDatabaseView } from 'src/sections/database/destroy-database-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Destroy Database - ${CONFIG.appName}`}</title>

      <DestroyDatabaseView />
    </>
  );
}
