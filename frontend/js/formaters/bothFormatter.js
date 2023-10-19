export function bothFormatter(data) {
   const formattedData = JSON.stringify(data, null, 4);
   return `<pre>Formatted by bothFormatter:<br>${formattedData}</pre>`;
}
