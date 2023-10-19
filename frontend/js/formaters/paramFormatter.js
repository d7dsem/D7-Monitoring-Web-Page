export function paramFormatter(data) {
   const formattedData = JSON.stringify(data, null, 4);
   return `<pre>Formatted by paramFormatter:<br>${formattedData}</pre>`;
}
