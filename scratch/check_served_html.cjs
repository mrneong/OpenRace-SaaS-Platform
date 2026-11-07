(async () => {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  console.log('HTML Total Length:', html.length);
  const scriptIdx = html.indexOf('<script>');
  console.log('<script> index in served HTML:', scriptIdx);
  if (scriptIdx !== -1) {
    console.log('Context around <script>:\n', html.slice(scriptIdx - 100, scriptIdx + 200));
  } else {
    console.log('Last 500 characters of served HTML:\n', html.slice(-500));
  }
})();
