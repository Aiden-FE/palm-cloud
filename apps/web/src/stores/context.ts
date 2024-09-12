import { createStore } from 'zustand/vanilla';

export type ContextState = {
  /** 用户登录信息 */
  userInfo?: any;
  /** 授权信息 */
  access_token?: string;
  /** 刷新授权token */
  refresh_token?: string;
};

export type ContextActions = {
  setUserInfo: (userInfo?: ContextState['userInfo']) => void;
  setToken: (data: { access_token: string; refresh_token?: string }) => void;
};

export type ContextStore = ContextState & ContextActions;

export const createDefaultContextState = () => ({}) as ContextState;

export const createContextStore = (initState: ContextState = createDefaultContextState()) =>
  createStore<ContextStore>()((set) => ({
    ...initState,
    setUserInfo: (userInfo) =>
      set((state) => ({
        ...state,
        userInfo,
      })),
    setToken: (data) =>
      set((state) => ({
        ...state,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })),
  }));
