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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getValidGoogleAccessToken(session.user.id);

    if (!accessToken) {
      return NextResponse.json({
        success: true,
        googleConnected: false,
        driveScopeGranted: false,
        files: [],
      });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type") || "all";
    const folderId = searchParams.get("folderId") || "";

    // Build Google Drive q query
    const queryParts: string[] = ["trashed = false"];

    if (folderId) {
      queryParts.push(`'${folderId}' in parents`);
    }

    if (search) {
      // Escape single quotes for Google Drive search syntax
      const cleanSearch = search.replace(/'/g, "\\'");
      queryParts.push(`name contains '${cleanSearch}'`);
    }

    if (type === "spreadsheet") {
      queryParts.push("mimeType = 'application/vnd.google-apps.spreadsheet'");
    } else if (type === "document") {
      queryParts.push("mimeType = 'application/vnd.google-apps.document'");
    } else if (type === "presentation") {
      queryParts.push("mimeType = 'application/vnd.google-apps.presentation'");
    } else if (type === "folder") {
      queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
    }

    const q = queryParts.join(" and ");

    const driveUrl = new URL("https://www.googleapis.com/drive/v3/files");
    driveUrl.searchParams.set("q", q);
    driveUrl.searchParams.set("pageSize", "50");
    driveUrl.searchParams.set("fields", "nextPageToken,files(id,name,mimeType,modifiedTime,size,iconLink,webViewLink,thumbnailLink,owners,starred,sharedWithMeTime)");
    driveUrl.searchParams.set("orderBy", "folder,modifiedTime desc");

    const driveRes = await fetch(driveUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!driveRes.ok) {
      const errData = await driveRes.json().catch(() => ({}));
      console.warn("[GoogleDriveAPI] Error fetching files:", driveRes.status, errData);

      if (driveRes.status === 403 || driveRes.status === 401) {
        return NextResponse.json({
          success: true,
          googleConnected: true,
          driveScopeGranted: false,
          error: errData?.error?.message || "Drive scope not granted or expired",
          files: [],
        });
      }

      return NextResponse.json(
        { error: errData?.error?.message || "Failed to fetch Drive files" },
        { status: driveRes.status }
      );
    }

    const driveData = await driveRes.json();

    return NextResponse.json({
      success: true,
      googleConnected: true,
      driveScopeGranted: true,
      files: driveData.files || [],
      nextPageToken: driveData.nextPageToken || null,
    });
  } catch (error: any) {
    console.error("[GoogleDriveAPI] GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getValidGoogleAccessToken(session.user.id);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Google account not connected or token expired" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, type = "folder", parentFolderId } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let mimeType = "application/vnd.google-apps.folder";
    if (type === "spreadsheet") {
      mimeType = "application/vnd.google-apps.spreadsheet";
    } else if (type === "document") {
      mimeType = "application/vnd.google-apps.document";
    }

    const requestBody: Record<string, any> = {
      name: name.trim(),
      mimeType,
    };

    if (parentFolderId) {
      requestBody.parents = [parentFolderId];
    }

    const res = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message || "Failed to create resource" },
        { status: res.status }
      );
    }

    const newResource = await res.json();
    return NextResponse.json({ success: true, file: newResource }, { status: 201 });
  } catch (error: any) {
    console.error("[GoogleDriveAPI] POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

