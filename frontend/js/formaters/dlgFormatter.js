export function dlgFormatter(data) {
   const formattedData = JSON.stringify(data, null, 4);
   return `<pre>Formatted by dlgFormatter:<br>${formattedData}</pre>`;
}
