import { buildSampleWorkbook } from "@/lib/excel";

export const runtime = "nodejs";

export async function GET() {
  const bytes = await buildSampleWorkbook();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename*=UTF-8''%E5%AE%9B%E5%85%88%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB.xlsx",
      "Cache-Control": "no-store",
    },
  });
}
