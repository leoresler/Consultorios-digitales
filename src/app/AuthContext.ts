import { createContext } from 'react';

import type { AuthEstado } from '@/controllers/useAuth';

export const AuthContext = createContext<AuthEstado | null>(null);
