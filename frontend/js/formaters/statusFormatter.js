export function statusFormatter(data) {
   const formattedData = JSON.stringify(data, null, 4);
   return `<pre>Formatted by statusFormatter:<br>${formattedData}</pre>`;
}
