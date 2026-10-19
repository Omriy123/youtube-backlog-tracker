# THROWAWAY local-only static preview. No dependencies, writes, APIs, or persistence.
param([int]$Port = 8770)
$previewRoot = $PSScriptRoot
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Metadata-check prototype: http://127.0.0.1:$Port/?variant=A"
Write-Host 'Stop with Ctrl+C. All mock edits reset on refresh.'
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
      $files = @{ '/' = 'index.html'; '/index.html' = 'index.html'; '/prototype.css' = 'prototype.css'; '/prototype.js' = 'prototype.js' }
      if ($files.ContainsKey($route)) {
        $file = Join-Path $previewRoot $files[$route]
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $types = @{ '.html' = 'text/html'; '.css' = 'text/css'; '.js' = 'text/javascript' }
        $type = $types[[System.IO.Path]::GetExtension($file)]
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
      # Browsers may abandon speculative connections without sending a request.
    } finally { $client.Close() }
  }
} finally { $listener.Stop() }
