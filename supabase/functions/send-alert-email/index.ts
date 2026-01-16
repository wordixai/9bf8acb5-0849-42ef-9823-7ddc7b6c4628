import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface AlertEmailRequest {
  contacts: {
    name: string;
    email: string;
  }[];
  userName?: string;
  lastCheckIn?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const { contacts, userName = "用户", lastCheckIn }: AlertEmailRequest = await req.json();

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No contacts provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const results = await Promise.all(
      contacts.map(async (contact) => {
        const emailResponse = await resend.emails.send({
          from: "死了么 <onboarding@resend.dev>",
          to: [contact.email],
          subject: `⚠️ 紧急通知：${userName} 已超过48小时未签到`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff;">
              <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #ff6b6b;">
                <h1 style="color: #ff6b6b; margin: 0; font-size: 28px;">⚠️ 紧急通知</h1>
              </div>

              <div style="padding: 30px 20px;">
                <p style="font-size: 16px; color: #e0e0e0;">您好，${contact.name}：</p>

                <div style="background: linear-gradient(135deg, #ff6b6b20, #ff8e5320); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ff6b6b;">
                  <p style="margin: 0; font-size: 18px; color: #ff6b6b; font-weight: bold;">
                    ${userName} 已超过 48 小时未在「死了么」应用中签到
                  </p>
                  ${lastCheckIn ? `<p style="margin: 15px 0 0; color: #a0a0a0; font-size: 14px;">最后签到时间：${lastCheckIn}</p>` : ''}
                </div>

                <p style="font-size: 15px; color: #b0b0b0; line-height: 1.8;">
                  作为 ${userName} 设置的紧急联系人，我们希望通知您这一情况。
                  请通过其他方式确认 ${userName} 的安全状况。
                </p>

                <div style="background: #2a2a4a; padding: 20px; border-radius: 8px; margin-top: 25px;">
                  <p style="margin: 0; color: #8888aa; font-size: 13px;">
                    💡 这是一封自动发送的邮件，来自「死了么」应用的紧急通知系统。
                  </p>
                </div>
              </div>

              <div style="text-align: center; padding: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
                <p style="margin: 0;">© 死了么 - 每日签到，让关心你的人安心</p>
              </div>
            </div>
          `,
        });
        return { contact: contact.email, response: emailResponse };
      })
    );

    console.log("Alert emails sent successfully:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-alert-email function:", error);
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
