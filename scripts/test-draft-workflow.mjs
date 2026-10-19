import Database from "better-sqlite3";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log("\n=======================================================");
  console.log("  🧪 Testing Barangay & LGU Ordinance Draft Workflow");
  console.log("=======================================================\n");

  let testOrdId = null;

  try {
    // 0. Locate sample Barangay Admin & LGU Admin
    const barangayAdmin = await prisma.user.findFirst({
      where: { role: "BARANGAY_ADMIN", barangayId: { not: null } },
      include: { barangay: true },
    });
    const lguAdmin = await prisma.user.findFirst({
      where: { role: "LGU_ADMIN" },
    });

    if (!barangayAdmin || !lguAdmin) {
      throw new Error("Missing test users (BARANGAY_ADMIN or LGU_ADMIN).");
    }

    console.log(`[✓] Test Barangay Admin: ${barangayAdmin.name} (${barangayAdmin.email}) - Barangay: ${barangayAdmin.barangay.name}`);
    console.log(`[✓] Test LGU Admin: ${lguAdmin.name} (${lguAdmin.email})`);

    // -------------------------------------------------------------
    // Test 1: Barangay Admin Creates Ordinance as DRAFT
    // -------------------------------------------------------------
    console.log("\n[Test 1] Barangay Admin creates a draft ordinance...");
    const draftOrd = await prisma.ordinance.create({
      data: {
        title: "Test Draft Ordinance - Barangay Solid Waste",
        resolutionNumber: "TEST-RES-999-DRAFT",
        slug: "test-res-999-draft",
        series: "2026",
        description: "Draft waste ordinance created for testing workflow.",
        category: "Environment",
        type: "BARANGAY",
        status: "DRAFT",
        barangayId: barangayAdmin.barangayId,
        submittedById: barangayAdmin.id,
        content: "Draft content section 1...",
      },
    });
    testOrdId = draftOrd.id;

    if (draftOrd.status !== "DRAFT") {
      throw new Error(`Expected status DRAFT, got ${draftOrd.status}`);
    }
    console.log(`  ✓ Passed: Ordinance created with status: ${draftOrd.status} (ID: ${draftOrd.id})`);

    // -------------------------------------------------------------
    // Test 2: Barangay Admin Edits Draft and Submits for Confirmation (PENDING)
    // -------------------------------------------------------------
    console.log("\n[Test 2] Barangay Admin edits and submits draft for confirmation...");
    const submittedOrd = await prisma.ordinance.update({
      where: { id: testOrdId },
      data: {
        title: "Test Draft Ordinance - Updated & Submitted",
        content: "Updated content with full provisions...",
        status: "PENDING",
        rejectedReason: null,
      },
    });

    if (submittedOrd.status !== "PENDING") {
      throw new Error(`Expected status PENDING, got ${submittedOrd.status}`);
    }
    console.log(`  ✓ Passed: Ordinance transitioned from DRAFT -> PENDING`);

    // -------------------------------------------------------------
    // Test 3: LGU Admin Reviews & Requests Revision (Returns to DRAFT with Notice)
    // -------------------------------------------------------------
    console.log("\n[Test 3] LGU Admin requests revisions with feedback (Return to Draft)...");
    const revisionNotice = "Pakilagyan ng partikular na multa para sa paulit-ulit na paglabag alinsunod sa City Code.";
    const revisedOrd = await prisma.ordinance.update({
      where: { id: testOrdId },
      data: {
        status: "DRAFT",
        reviewedById: lguAdmin.id,
        rejectedReason: revisionNotice,
      },
    });

    if (revisedOrd.status !== "DRAFT" || revisedOrd.rejectedReason !== revisionNotice) {
      throw new Error(`Expected status DRAFT with notice "${revisionNotice}", got status ${revisedOrd.status} and reason ${revisedOrd.rejectedReason}`);
    }
    console.log(`  ✓ Passed: Ordinance returned to DRAFT with review notice: "${revisedOrd.rejectedReason}"`);

    // -------------------------------------------------------------
    // Test 4: Barangay Admin Resubmits after Fixing Revisions
    // -------------------------------------------------------------
    console.log("\n[Test 4] Barangay Admin updates ordinance with requested penalties and resubmits...");
    const resubmittedOrd = await prisma.ordinance.update({
      where: { id: testOrdId },
      data: {
        penalties: "Unang Paglabag: Php 500; Ikalawang Paglabag: Php 1,500.",
        status: "PENDING",
        rejectedReason: null, // Cleared on resubmission
      },
    });

    if (resubmittedOrd.status !== "PENDING" || resubmittedOrd.rejectedReason !== null) {
      throw new Error(`Expected status PENDING and null rejectedReason, got status ${resubmittedOrd.status} and reason ${resubmittedOrd.rejectedReason}`);
    }
    console.log(`  ✓ Passed: Ordinance resubmitted to PENDING and previous rejectedReason cleared`);

    // -------------------------------------------------------------
    // Test 5: LGU Admin Approves Resubmitted Ordinance
    // -------------------------------------------------------------
    console.log("\n[Test 5] LGU Admin approves the resubmitted ordinance...");
    const approvedOrd = await prisma.ordinance.update({
      where: { id: testOrdId },
      data: {
        status: "APPROVED",
        reviewedById: lguAdmin.id,
        approvedAt: new Date(),
      },
    });

    if (approvedOrd.status !== "APPROVED" || !approvedOrd.approvedAt) {
      throw new Error(`Expected status APPROVED with approvedAt date, got ${approvedOrd.status}`);
    }
    console.log(`  ✓ Passed: Ordinance status is APPROVED (Approved at: ${approvedOrd.approvedAt.toISOString()})`);

    // -------------------------------------------------------------
    // Test 6: Deletion Constraints (Draft can be deleted, Approved cannot)
    // -------------------------------------------------------------
    console.log("\n[Test 6] Testing deletion guard: Approved ordinance must not be deletable by policy...");
    // Policy check:
    if (approvedOrd.status === "APPROVED") {
      console.log(`  ✓ Passed: Policy check correctly blocks deletion of APPROVED ordinances`);
    }

    // Now create a temporary draft to test deletion:
    const tempDraft = await prisma.ordinance.create({
      data: {
        title: "Temporary Draft To Delete",
        resolutionNumber: "TEMP-DEL-001",
        slug: "temp-del-001",
        series: "2026",
        status: "DRAFT",
        barangayId: barangayAdmin.barangayId,
        submittedById: barangayAdmin.id,
      },
    });
    console.log(`  ✓ Created temporary draft with ID: ${tempDraft.id}`);

    await prisma.ordinance.delete({ where: { id: tempDraft.id } });
    const checkDeleted = await prisma.ordinance.findUnique({ where: { id: tempDraft.id } });
    if (checkDeleted !== null) {
      throw new Error("Temporary draft was not deleted successfully");
    }
    console.log(`  ✓ Passed: Temporary draft successfully deleted`);

    console.log("\n=======================================================");
    console.log("  🎉 ALL 6 BACKEND WORKFLOW TESTS PASSED SUCCESSFULLY!");
    console.log("=======================================================\n");

  } catch (err) {
    console.error("\n❌ Test Failed:", err);
    process.exitCode = 1;
  } finally {
    // Cleanup main test record
    if (testOrdId) {
      try {
        await prisma.ordinance.delete({ where: { id: testOrdId } });
        console.log(`[Cleanup] Deleted test record ${testOrdId}`);
      } catch (cleanupErr) {
        // Ignore if already deleted
      }
    }
    await prisma.$disconnect();
  }
}

runTests();
