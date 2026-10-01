const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 3000;
const types = {
  ".html":"text/html; charset=utf-8",
  ".js":"application/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
  ".mp4":"video/mp4"
};

http.createServer((req,res)=>{
  const host = (req.headers.host || "").split(":")[0].toLowerCase();

  // Keep one canonical domain for SEO and analytics.
  if (host === "www.sharkninja.site") {
    res.writeHead(301, {
      "Location": "https://sharkninja.site" + (req.url || "/"),
      "Cache-Control": "public, max-age=3600"
    });
    return res.end();
  }

  let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let file = path.join(root, pathname === "/" ? "index.html" : pathname.replace(/^\//,""));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.stat(file,(err,st)=>{
    if (!err && st.isFile()) {
      res.writeHead(200,{"Content-Type":types[path.extname(file).toLowerCase()]||"application/octet-stream"});
      fs.createReadStream(file).pipe(res);
    } else {
      fs.createReadStream(path.join(root,"index.html"))
        .on("error",()=>{res.writeHead(404);res.end("Not found");})
        .once("open",()=>res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}))
        .pipe(res);
    }
  });
}).listen(port, "0.0.0.0", ()=>console.log("Listening on",port));
