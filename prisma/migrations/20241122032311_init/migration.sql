-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "organization_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "is_org_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipcode" TEXT,
    "domain" TEXT,
    "subdomain" TEXT,
    "max_users" INTEGER NOT NULL DEFAULT 5,
    "max_readonly_users" INTEGER NOT NULL DEFAULT 20,
    "subscription" "SubscriptionTier" NOT NULL DEFAULT 'BASIC',
    "subscription_ends" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientName" TEXT,
    "clientOrganization" TEXT,
    "clientEmail" TEXT,
    "clientAddress" TEXT,
    "clientCity" TEXT,
    "clientState" TEXT,
    "clientZipcode" TEXT,
    "summary" TEXT,
    "analysis" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "case_date" TIMESTAMP(3),
    "case_category" TEXT,
    "case_type" TEXT,
    "case_priority" TEXT,
    "case_notes" TEXT,
    "chain_of_custody" TEXT,
    "case_assignee" TEXT,
    "case_examiner" TEXT,
    "case_investigator" TEXT,
    "case_lead" TEXT,
    "organization_id" INTEGER,
    "organizationName" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'pending',
    "evidence_count" INTEGER NOT NULL DEFAULT 0,
    "storage_total" BIGINT NOT NULL DEFAULT 0,
    "active_tasks" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forensic_images" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_type" TEXT NOT NULL,
    "symlink_path" TEXT NOT NULL,
    "size" BIGINT,
    "case_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forensic_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_actions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "case_id" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "case_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "case_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "evidence_number" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    "case_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Custody',
    "location" TEXT,
    "storage_location" TEXT,
    "md5_hash" TEXT,
    "sha256_hash" TEXT,
    "acquisition_date" TIMESTAMP(3),
    "size" BIGINT,
    "file_path" TEXT,
    "original_name" TEXT,
    "mime_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "evidence_location_id" INTEGER,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organization_id" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_fields" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_custom_fields" (
    "id" SERIAL NOT NULL,
    "evidence_id" INTEGER NOT NULL,
    "field_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chain_of_custody" (
    "id" SERIAL NOT NULL,
    "evidence_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "location" TEXT,
    "signature" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chain_of_custody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "software_licenses" (
    "id" SERIAL NOT NULL,
    "vendor" TEXT NOT NULL,
    "software_name" TEXT NOT NULL,
    "license_name" TEXT NOT NULL,
    "edition" TEXT,
    "purchase_date" TIMESTAMP(3),
    "expire_date" TIMESTAMP(3),
    "cost" DECIMAL(10,2),
    "sms_cost" DECIMAL(10,2),
    "location" TEXT,
    "notes" TEXT,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "software_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serial_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "location" TEXT,
    "last_calibration" TIMESTAMP(3),
    "next_calibration" TIMESTAMP(3),
    "last_maintenance" TIMESTAMP(3),
    "next_maintenance" TIMESTAMP(3),
    "notes" TEXT,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ORGANIZATION',
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qa_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_checklist_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "organization_id" INTEGER NOT NULL,
    "template_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "value" TEXT,
    "notes" TEXT,

    CONSTRAINT "qa_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_checklist_responses" (
    "id" SERIAL NOT NULL,
    "checklist_item_id" INTEGER NOT NULL,
    "case_id" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completed_by" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qa_checklist_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "estimated_hours" INTEGER,
    "checklist" JSONB,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "due_date" TIMESTAMP(3),
    "assigned_to" INTEGER,
    "case_id" INTEGER NOT NULL,
    "template_id" INTEGER,
    "estimated_hours" INTEGER,
    "actual_hours" INTEGER,
    "checklist" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sections" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "organization_id" INTEGER,
    "metadata" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "caseId" INTEGER NOT NULL,
    "templateId" INTEGER,

    CONSTRAINT "generated_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "details" JSONB,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_locations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "organization" TEXT,
    "notes" TEXT,
    "organization_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "important" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "case_id" INTEGER,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "attachments" JSONB,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CaseContacts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_domain_key" ON "organizations"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_subdomain_key" ON "organizations"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "case_actions_case_id_name_key" ON "case_actions"("case_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_evidence_number_key" ON "evidence"("evidence_number");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_types_organization_id_name_key" ON "evidence_types"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "custom_fields_organization_id_name_key" ON "custom_fields"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_custom_fields_evidence_id_field_id_key" ON "evidence_custom_fields"("evidence_id", "field_id");

-- CreateIndex
CREATE INDEX "qa_templates_user_id_idx" ON "qa_templates"("user_id");

-- CreateIndex
CREATE INDEX "generated_reports_userId_idx" ON "generated_reports"("userId");

-- CreateIndex
CREATE INDEX "generated_reports_caseId_idx" ON "generated_reports"("caseId");

-- CreateIndex
CREATE INDEX "generated_reports_templateId_idx" ON "generated_reports"("templateId");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_idx" ON "audit_logs"("organization_id");

-- CreateIndex
CREATE INDEX "messages_contact_id_idx" ON "messages"("contact_id");

-- CreateIndex
CREATE INDEX "messages_case_id_idx" ON "messages"("case_id");

-- CreateIndex
CREATE INDEX "messages_organization_id_idx" ON "messages"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CaseContacts_AB_unique" ON "_CaseContacts"("A", "B");

-- CreateIndex
CREATE INDEX "_CaseContacts_B_index" ON "_CaseContacts"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forensic_images" ADD CONSTRAINT "forensic_images_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forensic_images" ADD CONSTRAINT "forensic_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_actions" ADD CONSTRAINT "case_actions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "evidence_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_evidence_location_id_fkey" FOREIGN KEY ("evidence_location_id") REFERENCES "evidence_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_types" ADD CONSTRAINT "evidence_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_fields" ADD CONSTRAINT "custom_fields_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_custom_fields" ADD CONSTRAINT "evidence_custom_fields_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_custom_fields" ADD CONSTRAINT "evidence_custom_fields_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "custom_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_of_custody" ADD CONSTRAINT "chain_of_custody_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_of_custody" ADD CONSTRAINT "chain_of_custody_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_licenses" ADD CONSTRAINT "software_licenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_templates" ADD CONSTRAINT "qa_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_templates" ADD CONSTRAINT "qa_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_checklist_items" ADD CONSTRAINT "qa_checklist_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "qa_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_checklist_items" ADD CONSTRAINT "qa_checklist_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_checklist_responses" ADD CONSTRAINT "qa_checklist_responses_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_checklist_responses" ADD CONSTRAINT "qa_checklist_responses_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "qa_checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_checklist_responses" ADD CONSTRAINT "qa_checklist_responses_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "task_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_locations" ADD CONSTRAINT "evidence_locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseContacts" ADD CONSTRAINT "_CaseContacts_A_fkey" FOREIGN KEY ("A") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseContacts" ADD CONSTRAINT "_CaseContacts_B_fkey" FOREIGN KEY ("B") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
