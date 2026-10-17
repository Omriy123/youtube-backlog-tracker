# THROWAWAY static preview. Bind to loopback; serve only this comparison.
param([int]$Port = 8767)
$previewRoot = $PSScriptRoot
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Capture review prototype: http://127.0.0.1:$Port/popup.html"
try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 1500
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream)
      $request = $reader.ReadLine()
      if (-not $request) { continue }
      while ($reader.ReadLine()) { }
      $route = ($request.Split(' ')[1] -split '\?')[0]
      $files = @{ '/' = 'index.html'; '/index.html' = 'index.html'; '/popup.html' = 'popup.html' }
      if ($files.ContainsKey($route)) {
        $bytes = [System.IO.File]::ReadAllBytes((Join-Path $previewRoot $files[$route]))
        $type = 'text/html'
        $status = '200 OK'
      } else {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not found')
        $type = 'text/plain'
        $status = '404 Not Found'
      }
      $header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $type; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n")
      $stream.Write($header, 0, $header.Length)
      $stream.Write($bytes, 0, $bytes.Length)
    } catch {
      # A speculative browser connection can disappear without a request.
    } finally { $client.Close() }
  }
} finally { $listener.Stop() }
