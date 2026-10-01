Add-Type -AssemblyName System.Drawing
$iconDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../icons'))
$scale = 4
$canvas = New-Object System.Drawing.Bitmap(512, 512)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.ScaleTransform($scale, $scale)
$orange = [System.Drawing.ColorTranslator]::FromHtml('#f58b38')
$cream = [System.Drawing.ColorTranslator]::FromHtml('#fff7ed')
$ink = [System.Drawing.ColorTranslator]::FromHtml('#2b1b10')
$background = New-Object System.Drawing.Drawing2D.GraphicsPath
$background.AddArc(0, 0, 56, 56, 180, 90)
$background.AddArc(72, 0, 56, 56, 270, 90)
$background.AddArc(72, 72, 56, 56, 0, 90)
$background.AddArc(0, 72, 56, 56, 90, 90)
$background.CloseFigure()
$orangeBrush = New-Object System.Drawing.SolidBrush($orange)
$inkBrush = New-Object System.Drawing.SolidBrush($ink)
$graphics.FillPath($orangeBrush, $background)
$lensPen = New-Object System.Drawing.Pen($cream, 9)
$lensPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$lensPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawEllipse($lensPen, 56, 27, 38, 38)
$graphics.DrawLine($lensPen, 89, 60, 107, 78)
$cursor = New-Object System.Drawing.Drawing2D.GraphicsPath
$cursor.AddPolygon([System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(27,43), [System.Drawing.PointF]::new(27,98),
  [System.Drawing.PointF]::new(41,84), [System.Drawing.PointF]::new(51,105),
  [System.Drawing.PointF]::new(63,99), [System.Drawing.PointF]::new(53,79),
  [System.Drawing.PointF]::new(74,79)
))
$graphics.FillPath($inkBrush, $cursor)
$cursorPen = New-Object System.Drawing.Pen($orange, 3)
$cursorPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawPath($cursorPen, $cursor)
foreach ($size in @(16,48,128)) {
  $bitmap = New-Object System.Drawing.Bitmap($size,$size)
  $output = [System.Drawing.Graphics]::FromImage($bitmap)
  $output.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $output.DrawImage($canvas, 0, 0, $size, $size)
  $bitmap.Save((Join-Path $iconDirectory "icon$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $output.Dispose()
  $bitmap.Dispose()
}
$cursorPen.Dispose()
$cursor.Dispose()
$lensPen.Dispose()
$background.Dispose()
$orangeBrush.Dispose()
$inkBrush.Dispose()
$graphics.Dispose()
$canvas.Dispose()
