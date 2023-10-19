export function memFormatter(data) {
   const formattedData = JSON.stringify(data, null, 4);
   return `<pre>Formatted by memFormatter:<br>${formattedData}</pre>`;
}
