import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  children?: NavItem[];
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  
  {
    title: 'Database',
    path: '#',
    icon: icon('ic-storage'),
    children: [
      {
        title: 'DB List',
        path: '/database',
        icon: icon('ic-analytics'),
      },
      {
        title: 'Create DB',
        path: '/database/create',
        icon: icon('ic-user'),
      },
      {
        title: 'Destroy DB',
        path: '/database/destroy',
        icon: icon('ic-user'),
      },
    ],
  },
];
