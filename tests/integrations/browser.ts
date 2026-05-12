const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Root URL langsung mengarah ke halaman pengujian integrasi
    let pathname = url.pathname === "/" ? "/tests/integrations/index.html" : url.pathname;

    // Path relatif dari root proyek (karena server dijalankan dari root)
    const file = Bun.file("." + pathname);

    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("404 Not Found", { status: 404 });
  },
});

console.log(`Server integrasi berjalan di http://localhost:${server.port}`);
console.log("Buka http://localhost:3000 untuk menguji library di browser.");