# Detailed Setup Guide for Digital Forensics Case Management Tool

This guide provides comprehensive instructions for setting up and configuring the Case Management Tool for digital forensics environments.

## System Requirements

### Minimum Hardware Requirements
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB (varies based on evidence storage needs)
- Network: 100Mbps

### Recommended Hardware
- CPU: 8+ cores
- RAM: 16GB+
- Storage: 1TB+ SSD
- Network: 1Gbps+

### Software Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git
- npm or yarn
- Modern web browser (Chrome, Firefox, Edge)

## Installation Steps

### 1. Database Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE case_management;
CREATE USER forensics WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE case_management TO forensics;
```

### 2. Application Installation

```bash
# Clone repository
git clone https://github.com/yourusername/case-management-tool.git
cd case-management-tool

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate encryption key
openssl rand -base64 32
```

### 3. Environment Configuration

Edit your `.env` file:

```env
# Database
DATABASE_URL="postgresql://forensics:your-secure-password@localhost:5432/case_management"

# Security
NEXTAUTH_SECRET="your-generated-key"
NEXTAUTH_URL="http://localhost:3000"

# Storage
EVIDENCE_STORAGE_PATH="/path/to/secure/storage"
```

### 4. Database Migration

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 5. Initial Setup

```bash
# Create first admin user
npm run setup-admin

# Build application
npm run build

# Start production server
npm start
```

## Security Configuration

### 1. File System Security

```bash
# Set secure permissions on evidence storage
sudo chown -R forensics:forensics /path/to/secure/storage
sudo chmod 700 /path/to/secure/storage
```

### 2. Database Security

```sql
-- Enable SSL for database connections
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file = 'server.key';
```

### 3. Application Security

- Configure firewall rules
- Set up SSL/TLS certificates
- Enable audit logging
- Configure backup system

## Evidence Storage Configuration

### 1. Local Storage Setup

```bash
# Create evidence directories
mkdir -p /path/to/secure/storage/{pending,active,archived}
```

### 2. Backup Configuration

```bash
# Set up automated backups
sudo apt install restic
restic init --repo /path/to/backup

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
restic backup /path/to/secure/storage
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12
EOF

chmod +x backup.sh
```

## Quality Assurance Setup

### 1. Default Templates

```bash
# Import default QA templates
npm run import-qa-templates
```

### 2. Custom Templates

1. Navigate to Settings > QA Templates
2. Create templates for your specific needs:
   - Evidence handling procedures
   - Case review checklists
   - Report quality checks
   - Chain of custody verification

## User Management

### 1. Role Configuration

Available roles:
- Administrator
- Examiner
- Analyst
- Read-only

### 2. Access Control

Configure access based on:
- Case sensitivity
- Evidence type
- Department
- Security clearance

## Integration Setup

### 1. API Configuration

```bash
# Generate API keys
npm run generate-api-key
```

### 2. External Tools

Configure integration with:
- Forensic tools
- Evidence processing software
- Report generation systems
- Storage systems

## Maintenance

### 1. Database Maintenance

```bash
# Regular vacuum
sudo -u postgres psql -d case_management -c "VACUUM ANALYZE;"
```

### 2. Storage Maintenance

```bash
# Clean temporary files
find /path/to/secure/storage/temp -mtime +7 -delete
```

### 3. Backup Verification

```bash
# Verify backups
restic check
```

## Troubleshooting

### Common Issues

1. Database Connection
```bash
# Test connection
psql -h localhost -U forensics -d case_management
```

2. Storage Access
```bash
# Check permissions
ls -la /path/to/secure/storage
```

3. Service Status
```bash
# Check application status
pm2 status
```

## Performance Tuning

### 1. Database Optimization

```sql
-- Optimize for evidence handling
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET work_mem = '64MB';
```

## Compliance Notes

- Evidence handling procedures
- Chain of custody requirements
- Data protection regulations
- Audit requirements

