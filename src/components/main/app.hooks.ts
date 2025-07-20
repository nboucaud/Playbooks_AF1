import { User } from '@/application/types';
import { AFService, AFServiceConfig } from '@/application/services/services.type';
import { createContext, useContext } from 'react';

const baseURL =  'https://test.appflowy.cloud';
const gotrueURL =  'https://test.appflowy.cloud/gotrue';
const wsURL =  'wss://test.appflowy.cloud/ws/v1';

export const defaultConfig: AFServiceConfig = {
  cloudConfig: {
    baseURL,
    gotrueURL,
    wsURL,
  },
};

export const AFConfigContext = createContext<
  | {
  service: AFService | undefined;
  isAuthenticated: boolean;
  currentUser?: User;
  openLoginModal: (redirectTo?: string) => void;
}
  | undefined
>(undefined);

export function useCurrentUser () {
  const context = useContext(AFConfigContext);

  if (!context) {
    throw new Error('useCurrentUser must be used within a AFConfigContext');
  }

  return context.currentUser;
}

export function useService () {
  const context = useContext(AFConfigContext);

  if (!context) {
    throw new Error('useService must be used within a AFConfigContext');
  }

  return context.service;
}