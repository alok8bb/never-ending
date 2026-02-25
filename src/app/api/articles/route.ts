import { db } from "@/lib/db";
import { articles, contentTypeEnum } from "@/lib/db/schema";
import { desc, sql, and, eq, or, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 24;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const search = searchParams.get("search")?.trim() || null;
  const type = searchParams.get("type") || null;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(articles.title, `%${search}%`),
        ilike(articles.rawText, `%${search}%`),
        ilike(articles.description, `%${search}%`),
        ilike(articles.url, `%${search}%`)
      )
    );
  }

  if (type && contentTypeEnum.enumValues.includes(type as any)) {
    conditions.push(eq(articles.contentType, type as any));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(where)
      .orderBy(desc(articles.postedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(where),
  ]);

  const total = Number(countResult[0].count);

  return NextResponse.json({
    articles: rows,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  });
}
