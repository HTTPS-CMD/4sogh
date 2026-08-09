import { create } from "zustand";
import Cookies from "js-cookie";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  role: string | null; // <--- فیلد نقش اضافه شد

  // متد لاگین حالا نقش را هم می‌گیرد
  login: (access: string, refresh: string, role: string) => void;

  // متد جدید برای زمان ارتقای کاربر (مثلاً بعد از ثبت کسب‌وکار)
  updateTokensAndRole: (access: string, refresh: string, role: string) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // هنگام لود سایت، چک می‌کنیم آیا توکنی از قبل در مرورگر هست یا نه
  isAuthenticated: !!Cookies.get("access_token"),
  accessToken: Cookies.get("access_token") || null,
  role: Cookies.get("user_role") || null, // <--- خواندن نقش از کوکی

  login: (access, refresh, role) => {
    // ذخیره توکن‌ها در کوکی (اعتبار توکن اصلی 2 روز، توکن رفرش 5 روز)
    Cookies.set("access_token", access, { expires: 2 });
    Cookies.set("refresh_token", refresh, { expires: 5 });
    Cookies.set("user_role", role, { expires: 2 }); // <--- ذخیره نقش

    set({ isAuthenticated: true, accessToken: access, role });
  },

  updateTokensAndRole: (access, refresh, role) => {
    // جایگزین کردن توکن‌ها و نقش جدید در کوکی‌ها
    Cookies.set("access_token", access, { expires: 2 });
    Cookies.set("refresh_token", refresh, { expires: 5 });
    Cookies.set("user_role", role, { expires: 2 });

    set({ accessToken: access, role });
  },

  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_role"); // <--- پاک کردن نقش
    set({ isAuthenticated: false, accessToken: null, role: null });
  },
}));
