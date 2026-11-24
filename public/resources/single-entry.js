/* Every screen is embedded in index.html; routes select a view without extra HTML files. */
(()=>{
 const pages=JSON.parse(document.getElementById('readwy-page-sources').textContent);
 const query=new URLSearchParams(location.search);
 const requested=query.get('view');
 const program=/^(gst|orst|wst|srst|aral|interv|sra|reports)$/.test(query.get('journeyModule')||'');
 const key=program||(requested==='startup'||requested==='launch')?'application':Object.prototype.hasOwnProperty.call(pages,requested)?requested:'application';
 document.open();document.write(pages[key]);document.close();
 })();
