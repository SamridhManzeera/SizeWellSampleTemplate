import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../Components/Layouts/PageHero/PageHero';
import { useDemoApiQuery } from '../../Services/Api/module/demoApi';

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  );
}

export default function Dashboard() {
  const { data, error } = useDemoApiQuery('');
  console.log(data, error);
  return (
    <div>
      <PageHeader />

      <PageHero
        icon={<DashboardIcon />}
        title="Dashboard"
        subtitle="Overview of your IAM workspace."
        eyebrow={null}
        actions={null}
      />

      <div>Dashboard</div>
    </div>
  );
}
