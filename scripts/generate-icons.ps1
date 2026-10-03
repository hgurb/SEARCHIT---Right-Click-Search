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
$orangeBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.RectangleF]::new(0,0,128,128), [System.Drawing.ColorTranslator]::FromHtml('#ffb568'), [System.Drawing.ColorTranslator]::FromHtml('#e45b09'), [single]70)
$blend = [System.Drawing.Drawing2D.ColorBlend]::new(3)
$blend.Colors = [System.Drawing.Color[]]@([System.Drawing.ColorTranslator]::FromHtml('#ffb568'), [System.Drawing.ColorTranslator]::FromHtml('#ff8b2d'), [System.Drawing.ColorTranslator]::FromHtml('#e45b09'))
$blend.Positions = [single[]]@(0,0.45,1)
$orangeBrush.InterpolationColors = $blend
$inkBrush = New-Object System.Drawing.SolidBrush($ink)
$graphics.FillPath($orangeBrush, $background)
$shine = [System.Drawing.Drawing2D.GraphicsPath]::new()
$shine.AddArc(0,0,56,56,180,90)
$shine.AddLine(28,0,100,0)
$shine.AddArc(72,0,56,56,270,90)
$shine.AddLine(128,28,128,44)
$shine.AddBezier(128,44,85,64,43,64,0,44)
$shine.CloseFigure()
$shineBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.RectangleF]::new(0,0,128,64), [System.Drawing.Color]::FromArgb(82,255,255,255), [System.Drawing.Color]::FromArgb(0,255,255,255), [single]90)
$graphics.FillPath($shineBrush, $shine)
$rim = [System.Drawing.Drawing2D.GraphicsPath]::new()
$rim.AddArc(1.5,1.5,53,53,180,90)
$rim.AddArc(73.5,1.5,53,53,270,90)
$rim.AddArc(73.5,73.5,53,53,0,90)
$rim.AddArc(1.5,73.5,53,53,90,90)
$rim.CloseFigure()
$rimPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(56,255,255,255),[single]2)
$graphics.DrawPath($rimPen,$rim)
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
$shine.Dispose()
$shineBrush.Dispose()
$rim.Dispose()
$rimPen.Dispose()
$inkBrush.Dispose()
$graphics.Dispose()
$canvas.Dispose()
