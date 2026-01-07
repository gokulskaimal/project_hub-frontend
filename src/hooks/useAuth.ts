
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const useAuth = () => {
    const { user, isLoggedIn, loading, accessToken } = useSelector((state: RootState) => state.auth);
    return { user, isAuthenticated: isLoggedIn, loading, token: accessToken };
};
