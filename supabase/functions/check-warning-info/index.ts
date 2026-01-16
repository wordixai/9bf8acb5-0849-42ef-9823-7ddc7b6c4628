import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface UserWarningInfo {
  userId: string;
  username: string;
  email: string;
  lastCheckIn: string | null;
  hoursSinceLastCheckIn: number | null;
  status: 'safe' | 'warning' | 'danger' | 'never';
  emergencyContactsCount: number;
  notificationSent: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 获取所有用户的签到状态
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select(`
        user_id,
        username,
        last_check_in,
        notification_sent
      `);

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    const now = Date.now();
    const warnings: UserWarningInfo[] = [];

    for (const profile of profiles || []) {
      // 获取紧急联系人数量
      const { count: contactsCount } = await supabaseAdmin
        .from("emergency_contacts")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", profile.user_id);

      // 获取用户邮箱
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);

      let hoursSinceLastCheckIn: number | null = null;
      let status: 'safe' | 'warning' | 'danger' | 'never' = 'never';

      if (profile.last_check_in) {
        const lastCheckInTime = new Date(profile.last_check_in).getTime();
        hoursSinceLastCheckIn = (now - lastCheckInTime) / (1000 * 60 * 60);

        if (hoursSinceLastCheckIn < 24) {
          status = 'safe';
        } else if (hoursSinceLastCheckIn < 48) {
          status = 'warning';
        } else {
          status = 'danger';
        }
      }

      warnings.push({
        userId: profile.user_id,
        username: profile.username || '未知用户',
        email: userData?.user?.email || '未知邮箱',
        lastCheckIn: profile.last_check_in,
        hoursSinceLastCheckIn: hoursSinceLastCheckIn ? Math.round(hoursSinceLastCheckIn * 10) / 10 : null,
        status,
        emergencyContactsCount: contactsCount || 0,
        notificationSent: profile.notification_sent || false,
      });
    }

    // 按状态排序：danger > warning > safe > never
    const statusOrder = { danger: 0, warning: 1, safe: 2, never: 3 };
    warnings.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    // 统计信息
    const summary = {
      total: warnings.length,
      safe: warnings.filter(w => w.status === 'safe').length,
      warning: warnings.filter(w => w.status === 'warning').length,
      danger: warnings.filter(w => w.status === 'danger').length,
      never: warnings.filter(w => w.status === 'never').length,
    };

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        users: warnings,
        checkedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-warning-info function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
