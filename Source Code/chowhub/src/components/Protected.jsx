import { useAtomValue } from 'jotai';
import { tokenAtom, userAtom } from '@/store/atoms';   
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Protected({ children }) {
  const token = useAtomValue(tokenAtom);
  const user  = useAtomValue(userAtom);              
  const router = useRouter();
  const { restaurantUsername } = router.query;       

  useEffect(() => {
    if (!token) {
      router.replace('/login');                       
    } else if (
      restaurantUsername &&                           
      user?.restaurantUsername &&                    
      restaurantUsername !== user.restaurantUsername  
    ) {
      router.replace(`/${user.restaurantUsername}/dashboard`);
    }
  }, [token, restaurantUsername]);

  return token ? children : null;
}
