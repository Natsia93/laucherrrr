<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Strict Deployment Rule
- **JANGAN PERNAH** menjalankan deploy (ke Vercel, production, staging, dsb.) secara otomatis atau atas inisiatif sendiri.
- Hanya lakukan deploy jika dan hanya jika pengguna secara **EKSPLISIT** memberikan instruksi untuk melakukan deploy (misal: "deploy sekarang", "tolong deploy").
- Tanpa instruksi eksplisit tersebut, batasi pekerjaan hanya pada perubahan lokal/repo saja.
