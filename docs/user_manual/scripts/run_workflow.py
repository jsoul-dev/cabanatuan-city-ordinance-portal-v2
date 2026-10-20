#!/usr/bin/env python3
"""
Master Workflow Orchestrator for Cabanatuan City Ordinance Portal User Manual.
Automates the full pipeline:
  1. Verifies connectivity to the live Next.js application at http://localhost:3000
  2. Executes Playwright browser automation (capture_screenshots.mjs)
  3. Executes Pillow programmatic annotation engine (annotate_screenshots.py)
  4. Generates publication-grade Microsoft Word user manual (generate_manual.py)
  5. Converts DOCX to certified PDF via Microsoft Word COM automation (convert_to_pdf.ps1)
  6. Performs output verification and structural reporting
"""

import os
import sys
import time
import subprocess
import urllib.request
from pathlib import Path

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

SCRIPTS_DIR = Path(__file__).resolve().parent
BASE_DIR = SCRIPTS_DIR.parent
OUTPUT_DIR = BASE_DIR / "output"
DOCX_PATH = OUTPUT_DIR / "Cabanatuan_City_Ordinance_Portal_User_Manual.docx"
PDF_PATH = OUTPUT_DIR / "Cabanatuan_City_Ordinance_Portal_User_Manual.pdf"

def check_server(url="http://localhost:3000"):
    print(f"[*] Checking local application server at {url}...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AntigravityOrchestrator/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status in (200, 301, 302, 307, 308):
                print(f"[OK] Live server confirmed responding (HTTP {response.status}).")
                return True
    except Exception as e:
        print(f"[!] Warning: Could not reach {url}: {e}")
        return False
    return False

def run_step(description, cmd, cwd=None):
    print(f"\n>>> Step: {description}")
    print(f"    Command: {cmd}")
    start = time.time()
    res = subprocess.run(cmd, shell=True, cwd=cwd or str(SCRIPTS_DIR))
    duration = time.time() - start
    if res.returncode != 0:
        print(f"[X] FAILED with exit code {res.returncode} ({duration:.1f}s)")
        sys.exit(res.returncode)
    print(f"[OK] Completed in {duration:.1f}s")

def main():
    print("=====================================================================")
    print("  AUTOMATED USER MANUAL GENERATION PIPELINE")
    print("  Cabanatuan City Ordinance Portal — Capstone Defense Edition")
    print("=====================================================================\n")

    # Step 1: Health Check
    if not check_server():
        print("[!] ERROR: Next.js dev server is not running on http://localhost:3000.")
        print("    Please run 'npm run dev' or 'npm run demo' in another terminal first.")
        sys.exit(1)

    # Step 2: Capture Screenshots
    run_step(
        "Capture Genuine Application Screenshots via Playwright",
        "node capture_screenshots.mjs"
    )

    # Step 3: Annotate Screenshots
    run_step(
        "Draw Numbered Highlights & Callout Badges via Python Pillow",
        "python annotate_screenshots.py"
    )

    # Step 4: Generate DOCX Manual
    run_step(
        "Generate Microsoft Word User Manual (.docx) via python-docx",
        "python generate_manual.py"
    )

    # Step 5: Convert DOCX to PDF
    run_step(
        "Convert DOCX to Matching PDF via Microsoft Word COM Automation",
        "powershell -ExecutionPolicy Bypass -File convert_to_pdf.ps1"
    )

    # Step 6: Verification & Summary
    print("\n=====================================================================")
    print("  PIPELINE COMPLETION & OUTPUT VERIFICATION")
    print("=====================================================================\n")

    if DOCX_PATH.exists():
        docx_size = DOCX_PATH.stat().st_size
        print(f"  ✓ Microsoft Word (.docx): {DOCX_PATH}")
        print(f"    Size: {docx_size:,} bytes ({docx_size / (1024*1024):.2f} MB)")
    else:
        print(f"  [X] Missing DOCX at {DOCX_PATH}")

    if PDF_PATH.exists():
        pdf_size = PDF_PATH.stat().st_size
        print(f"  ✓ Certified PDF Document: {PDF_PATH}")
        print(f"    Size: {pdf_size:,} bytes ({pdf_size / (1024*1024):.2f} MB)")
    else:
        print(f"  [X] Missing PDF at {PDF_PATH}")

    print("\n[SUCCESS] The user manual has been fully generated and is ready for distribution!")

if __name__ == "__main__":
    main()
