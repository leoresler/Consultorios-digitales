import type { ReactNode } from 'react';

import { useAuthController } from '@/controllers/useAuth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const estado = useAuthController();
  return <AuthContext.Provider value={estado}>{children}</AuthContext.Provider>;
}
