import { EncryptStorage } from "encrypt-storage";
import { AuthStateType, ZustandStorageType } from "src/types/store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY;
const STORAGE_NAME = import.meta.env.VITE_STORAGE_NAME;

const encryptedStorage = new EncryptStorage(STORAGE_KEY, {
  storageType: "sessionStorage",
  stateManagementUse: true,
});

const customSessionStorage: ZustandStorageType = {
  getItem: async (key) => {
    const item = await encryptedStorage.getItem(key);
    return item !== undefined ? item : null;
  },
  setItem: (key, value) => {
    return new Promise((resolve, reject) => {
      try {
        encryptedStorage.setItem(key, value);
        resolve();
      } catch (error: any) {
        reject(new Error(error.message));
      }
    });
  },
  removeItem: (key) => {
    return new Promise((resolve, reject) => {
      try {
        encryptedStorage.removeItem(key);
        resolve();
      } catch (error: any) {
        reject(new Error(error.message));
      }
    });
  },
};

const useAuthStore = create<AuthStateType>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (UserInfoResponse) => {
        set({
          user: UserInfoResponse,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: STORAGE_NAME,
      storage: createJSONStorage(() => customSessionStorage),
    },
  ),
);

export default useAuthStore;
