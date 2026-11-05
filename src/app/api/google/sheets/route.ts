import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getValidGoogleAccessToken } from "@/lib/google-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        googleConnected: false,
        sheetsScopeGranted: false,
        spreadsheets: [],
      });
    }

    const accessToken = await getValidGoogleAccessToken(session.user.id);

    if (!accessToken) {
      return NextResponse.json({
        success: true,
        googleConnected: false,
        sheetsScopeGranted: false,
        spreadsheets: [],
      });
    }

    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get("spreadsheetId");
    const tabName = searchParams.get("tab") || "";

    // 1. If spreadsheetId is specified, fetch the details and values of this spreadsheet
    if (spreadsheetId) {
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!metaRes.ok) {
        const err = await metaRes.json().catch(() => ({}));
        if (metaRes.status === 403 || metaRes.status === 401) {
          return NextResponse.json({
            success: true,
            googleConnected: true,
            sheetsScopeGranted: false,
            error: err?.error?.message || "Sheets scope not granted",
          });
        }
        return NextResponse.json(
          { error: err?.error?.message || "Failed to fetch spreadsheet metadata" },
          { status: metaRes.status }
        );
      }

      const meta = await metaRes.json();
      interface SheetTabItem {
        id?: number;
        title: string;
        rowCount?: number;
        columnCount?: number;
        frozenRowCount: number;
        frozenColumnCount: number;
      }

      const sheetTabs: SheetTabItem[] = (meta.sheets || []).map((s: {
        properties?: {
          sheetId?: number;
          title?: string;
          gridProperties?: {
            rowCount?: number;
            columnCount?: number;
            frozenRowCount?: number;
            frozenColumnCount?: number;
          };
        };
      }) => ({
        id: s.properties?.sheetId,
        title: s.properties?.title || "Sheet1",
        rowCount: s.properties?.gridProperties?.rowCount,
        columnCount: s.properties?.gridProperties?.columnCount,
        frozenRowCount: s.properties?.gridProperties?.frozenRowCount || 0,
        frozenColumnCount: s.properties?.gridProperties?.frozenColumnCount || 0,
      }));

      const activeTab = tabName || sheetTabs[0]?.title || "Sheet1";
      const currentTabMeta = sheetTabs.find((t: SheetTabItem) => t.title === activeTab) || sheetTabs[0];
      const frozenRowCount = currentTabMeta?.frozenRowCount ?? 1;
      const frozenColumnCount = currentTabMeta?.frozenColumnCount ?? 0;

      // Range covers up to column AZ and row 300 to prevent truncated tables
      const safeRangeQuery = `'${activeTab.replace(/'/g, "''")}'!A1:AZ300`;

      const valuesRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(safeRangeQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      let values: string[][] = [];
      if (valuesRes.ok) {
        const valuesData = await valuesRes.json();
        values = valuesData.values || [];
      } else {
        // Fallback to simple active tab query if range syntax failed
        const fallbackRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(activeTab)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          values = fbData.values || [];
        }
      }

      return NextResponse.json({
        success: true,
        googleConnected: true,
        sheetsScopeGranted: true,
        spreadsheet: {
          id: meta.spreadsheetId,
          title: meta.properties?.title || "Untitled Spreadsheet",
          url: meta.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${meta.spreadsheetId}/edit`,
          tabs: sheetTabs,
          activeTab,
          frozenRowCount,
          frozenColumnCount,
          values,
        },
      });
    }

    // 2. If no spreadsheetId, list user's spreadsheets from Google Drive
    const driveUrl = new URL("https://www.googleapis.com/drive/v3/files");
    driveUrl.searchParams.set("q", "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
    driveUrl.searchParams.set("pageSize", "30");
    driveUrl.searchParams.set("fields", "files(id,name,modifiedTime,webViewLink,iconLink)");
    driveUrl.searchParams.set("orderBy", "modifiedTime desc");

    const listRes = await fetch(driveUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      if (listRes.status === 403 || listRes.status === 401) {
        return NextResponse.json({
          success: true,
          googleConnected: true,
          sheetsScopeGranted: false,
          spreadsheets: [],
        });
      }
      return NextResponse.json(
        { error: err?.error?.message || "Failed to list spreadsheets" },
        { status: listRes.status }
      );
    }

    const listData = await listRes.json();

    return NextResponse.json({
      success: true,
      googleConnected: true,
      sheetsScopeGranted: true,
      spreadsheets: listData.files || [],
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("[GoogleSheetsAPI] GET error:", error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        googleConnected: false,
        sheetsScopeGranted: false,
        spreadsheets: [],
      });
    }

    const accessToken = await getValidGoogleAccessToken(session.user.id);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Google account not connected or token expired" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action = "create", spreadsheetId, title, range = "Sheet1!A1", values } = body;

    // A. Create new Spreadsheet
    if (action === "create") {
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            title: title?.trim() || "Launcher OS Data Sync",
          },
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: err?.error?.message || "Failed to create spreadsheet" },
          { status: createRes.status }
        );
      }

      const created = await createRes.json();
      return NextResponse.json({ success: true, spreadsheet: created }, { status: 201 });
    }

    // B. Append Row
    if (action === "append_row") {
      if (!spreadsheetId || !Array.isArray(values)) {
        return NextResponse.json(
          { error: "spreadsheetId and values (array) are required" },
          { status: 400 }
        );
      }

      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

      const appendRes = await fetch(appendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [values],
        }),
      });

      if (!appendRes.ok) {
        const err = await appendRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: err?.error?.message || "Failed to append row" },
          { status: appendRes.status }
        );
      }

      const appendData = await appendRes.json();
      return NextResponse.json({ success: true, result: appendData });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("[GoogleSheetsAPI] POST error:", error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

