// src/components/LogoutButton.jsx
import { useSetAtom } from 'jotai';
import { tokenAtom, userAtom } from '@/store/atoms';
import { useRouter } from 'next/router';

export default function LogoutButton() {
  const setToken = useSetAtom(tokenAtom);
  const setUser  = useSetAtom(userAtom);
  const router   = useRouter();

  return (
    <button
      className="btn btn-outline-danger btn-sm"
      onClick={() => {
        setToken(null);
        setUser(null);
        router.push('/login');
      }}
    >
      Logout
    </button>
  );
}
