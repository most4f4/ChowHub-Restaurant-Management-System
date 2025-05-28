import Protected, { ManagerOnly } from '@/components/Protected';
import DashboardLayout from '@/components/DashboardLayout';
import { useAtomValue } from 'jotai';
import { tokenAtom, userAtom } from '@/store/atoms';
import { Typography } from '@mui/material';

export default function ShiftsPage() {
  const user = useAtomValue(userAtom);
  const token = useAtomValue(tokenAtom);

  if (!user || !token) return null;

  return (
    <Protected>
      <ManagerOnly>
        <DashboardLayout>
          <Typography variant="h5" sx={{ mt: 2 }}>
            📌 This is the Shifts page.
          </Typography>
        </DashboardLayout>
      </ManagerOnly>
    </Protected>
  );
}
