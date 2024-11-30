import { Context, Schema, h } from "koishi";
import {} from "koishi-plugin-adapter-onebot";

export const name = "thumb-up";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
  ctx.i18n.define("zh-CN", require("./locales/zh_CN"));
  ctx = ctx.platform("onebot");

  const cmd = ctx.command("thumb-up <method> <target> [user]");

  // 批量添加别名
  ["赞", "超", "操", "草"].forEach((method) => {
    ["我", "他", "她", "它"].forEach((target) => {
      cmd.alias(`${method}${target}`, { args: [method, target] });
    });
  });

  cmd.action(async ({ session }, method, target, user) => {
    // 获取目标用户ID
    const targetId =
      target === "我"
        ? session.userId
        : user
        ? h.parse(user)[0]?.attrs?.id
        : null;

    if (!targetId) {
      return session.text(".no_user");
    }

    let successCount = 0;
    // 尝试点赞
    for (let i = 0; i < 6; i++) {
      try {
        await session.onebot.sendLike(targetId, 10);
        successCount++;
      } catch (e) {
        break;
      }
    }

    if (successCount === 0) {
      return session.text(".failed");
    }

    const count = successCount === 6 ? "好多" : successCount * 10;
    return session.text(".success", [
      target === "我" ? "你" : h.at(targetId),
      method,
      count,
    ]);
  });
}
