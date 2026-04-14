export async function GET() {
  const html = `<!DOCTYPE html>
<html>
<head><title>로그아웃 중...</title></head>
<body>
<script>
  try { localStorage.clear(); } catch(e) {}
  try { sessionStorage.clear(); } catch(e) {}
  try {
    document.cookie.split(';').forEach(function(c) {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });
  } catch(e) {}
  window.location.replace('/');
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
