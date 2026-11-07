fetch('http://localhost:3000').then(r => r.text()).then(html => {
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  scriptRegex.exec(html);
  const m2 = scriptRegex.exec(html);
  let script = m2[1];
  
  script = script.split("viewRawPayload('' + actId + '')").join("viewRawPayload(' + actId + ')");
  script = script.split("} catch (e: any) {").join("} catch (e) {");

  try {
    new Function(script);
    console.log('ENTIRE SCRIPT PARSED SUCCESSFULLY (0 ERRORS)!');
  } catch(e) {
    console.log('Still error:', e.message);
  }
});
