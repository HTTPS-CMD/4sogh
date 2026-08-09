"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Clock, Loader2, ChevronLeft, CheckCircle2, CalendarDays, Ticket } from "lucide-react";

export default function ClientDashboard() {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);

  // استیت‌های جدید برای وضعیت VIP
  const [vipStatus, setVipStatus] = useState<any>(null);
  const [isLoadingVip, setIsLoadingVip] = useState(true);

  const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (role === "BUSINESS_OWNER") {
        router.replace("/dashboard/owner");
      } else if (role === "ADMIN") {
        router.replace("/admin-panel");
      }
    }
  }, [isMounted, isAuthenticated, role, router]);




  // دریافت اطلاعات داشبورد
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || role !== "CLIENT") return;

      try {
        const token = Cookies.get("access_token");

        // دریافت همزمان وضعیت VIP، بازدیدهای اخیر، و کدهای تخفیف دریافتی
        const [vipRes, visitsRes, campaignsRes] = await Promise.all([
          api.get("/directory/client/vip/status/", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { is_vip: false } })),
          api.get("/directory/client/recent-visits/", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          api.get("/directory/client/campaigns/", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);

        setVipStatus(vipRes.data);
        setRecentVisits(visitsRes.data);
        setMyCampaigns(campaignsRes.data); // آپدیت استیت کدهای دریافتی

      } catch (error) {
        console.error("خطا در دریافت اطلاعات داشبورد:", error);
      } finally {
        setIsLoadingVip(false);
        setIsLoadingVisits(false);
        setIsLoadingCampaigns(false); // پایان لودینگ کمپین‌ها
      }
    };

    if (isMounted) fetchDashboardData();
  }, [isMounted, isAuthenticated, role]);

  if (!isMounted || !isAuthenticated || role === "BUSINESS_OWNER" || role === "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        در حال بررسی دسترسی...
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-gray-800">داشبورد کاربری</h2>
        <p className="text-gray-500 mt-1 font-medium">به پنل اختصاصی خود در چهارسوق خوش آمدید.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {/* کارت داینامیک وضعیت VIP */}
        <Card className={`col-span-full lg:col-span-2 border-none shadow-lg relative overflow-hidden ${vipStatus?.is_vip
          ? "bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900"
          : "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          }`}>
          {/* افکت‌های نوری پس‌زمینه */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Crown className={`w-7 h-7 ${vipStatus?.is_vip ? "text-slate-900" : "text-amber-400"}`} />
              {vipStatus?.is_vip ? "اشتراک VIP شما فعال است" : "وضعیت اشتراک VIP"}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoadingVip ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 animate-spin opacity-70" />
                <span className="text-sm opacity-80">در حال بررسی وضعیت اشتراک...</span>
              </div>
            ) : vipStatus?.is_vip ? (
              // UI برای کاربری که VIP دارد
              <div className="space-y-6 mt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-black text-lg flex items-center gap-2">
                    {vipStatus.plan_name}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {vipStatus.discount_percentage}٪ تخفیف ثابت
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4" />
                    اعتبار تا: {new Date(vipStatus.expiry_date).toLocaleDateString('fa-IR')}
                  </div>
                </div>
                <p className="text-sm font-bold opacity-80">
                  برای استفاده از تخفیف، کافیست شماره موبایل خود را به فروشنده‌های عضو چهارسوق اعلام کنید.
                </p>
              </div>
            ) : (
              // UI برای کاربری که VIP ندارد
              <>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  شما در حال حاضر اشتراک VIP فعالی ندارید. با تهیه اشتراک، در خریدهای خود از تمامی فروشگاه‌های چهارسوق تخفیف ثابت بگیرید.
                </p>
                <Link
                  href="/dashboard/client/vip"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-sm transition-all shadow-md hover:shadow-lg"
                >
                  مشاهده و خرید پلن‌ها
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* باکس بازدیدهای اخیر */}
        <Card className="shadow-sm border-gray-100 rounded-2xl flex flex-col">
          <CardHeader className="pb-4 border-b border-gray-50">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-black">
              <Clock className="w-5 h-5 text-blue-500" />
              بازدیدهای اخیر شما
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex-1">
            {isLoadingVisits ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 py-6">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-sm">در حال بارگذاری...</span>
              </div>
            ) : recentVisits.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10 font-medium">
                شما هنوز از فروشگاهی بازدید نکرده‌اید.
              </div>
            ) : (
              <ul className="space-y-3">
                {recentVisits.map((visit) => (
                  <li key={visit.id}>
                    <Link
                      href={`/business/${visit.business_slug}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                    >
                      <div>
                        <span className="block font-bold text-sm text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {visit.business_name}
                        </span>
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {visit.owner_name}
                        </span>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {/* باکس کدهای تخفیف من */}
        <Card className="shadow-sm border-gray-100 rounded-2xl flex flex-col lg:col-span-3 mt-6">
          <CardHeader className="pb-4 border-b border-gray-50">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800 font-black">
              <Ticket className="w-5 h-5 text-rose-500" />
              کدهای تخفیف دریافتی شما
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 flex-1">
            {isLoadingCampaigns ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-6">
                <Loader2 className="w-6 h-6 animate-spin text-rose-500 mb-2" />
                <span className="text-sm">در حال بارگذاری...</span>
              </div>
            ) : myCampaigns.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10 font-medium">
                شما هنوز هیچ کد تخفیفی دریافت نکرده‌اید.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCampaigns.map((camp: any) => (
                  <div key={camp.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 gap-4">
                    <div className="text-center sm:text-right w-full">
                      <Link href={`/business/${camp.business_slug}`} className="font-bold text-gray-800 hover:text-emerald-600 transition block mb-1">
                        {camp.business_name}
                      </Link>
                      <span className="text-rose-600 font-black text-sm block mb-1">{camp.title}</span>
                      <span className="text-xs text-gray-400">دریافت: {new Date(camp.claimed_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="w-full sm:w-auto text-center shrink-0">
                      {camp.is_redeemed ? (
                        <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold w-full block">
                          استفاده شده ✔️
                        </span>
                      ) : (
                        <div className="bg-white border-2 border-dashed border-gray-300 px-4 py-2 rounded-lg text-sm font-black tracking-widest text-slate-800">
                          {camp.code}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}