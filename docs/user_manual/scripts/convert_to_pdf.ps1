param(
    [string]$DocxPath = "$PSScriptRoot\..\output\Cabanatuan_City_Ordinance_Portal_User_Manual.docx",
    [string]$PdfPath = "$PSScriptRoot\..\output\Cabanatuan_City_Ordinance_Portal_User_Manual.pdf"
)

$docxResolved = [System.IO.Path]::GetFullPath($DocxPath)
$pdfResolved = [System.IO.Path]::GetFullPath($PdfPath)

Write-Host "======================================================="
Write-Host "  [PDF CONVERTER] Exporting DOCX to PDF via MS Word COM"
Write-Host "======================================================="
Write-Host "Source DOCX: $docxResolved"
Write-Host "Target PDF:  $pdfResolved"

if (-not (Test-Path $docxResolved)) {
    Write-Error "Source DOCX file not found: $docxResolved"
    exit 1
}

$word = $null
$doc = $null

try {
    Write-Host "Launching Microsoft Word COM Automation..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = [Microsoft.Office.Interop.Word.WdAlertLevel]::wdAlertsNone

    Write-Host "Opening document..."
    $doc = $word.Documents.Open($docxResolved, $false, $true) # ReadOnly

    Write-Host "Exporting to PDF format (wdExportFormatPDF = 17)..."
    # 17 = wdExportFormatPDF
    # Optimization: 0 = wdExportOptimizeForPrint
    $doc.ExportAsFixedFormat(
        $pdfResolved,
        17, # wdExportFormatPDF
        $false, # OpenAfterExport
        0 # wdExportOptimizeForPrint
    )

    Write-Host "[OK] PDF export successful!"
    $pdfInfo = Get-Item $pdfResolved
    Write-Host "Generated PDF Size: $($pdfInfo.Length) bytes"
}
catch {
    Write-Error "Failed to convert DOCX to PDF: $_"
    exit 1
}
finally {
    if ($doc -ne $null) {
        $doc.Close([Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
    }
    if ($word -ne $null) {
        $word.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

Write-Host "Conversion completed cleanly."
