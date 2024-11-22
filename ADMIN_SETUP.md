# Organization Admin Setup Guide

This guide explains how to set up the first organization admin and best practices for managing organization administrators in a production environment.

## Initial Setup

1. Set environment variables in your `.env` file:
```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password
```

2. Run the setup script:
```bash
npx ts-node scripts/setup-org-admin.ts
```

This will:
- Create the initial organization
- Create an admin user with the specified email
- Set up proper roles and permissions

## Production Best Practices

### 1. Organization Admin Creation

- Only allow organization admin creation through secure channels
- Implement email verification for new admin accounts
- Use strong password requirements
- Enable two-factor authentication for admin accounts
- Log all admin creation events for audit purposes

### 2. Security Measures

- Implement rate limiting on admin-related endpoints
- Use secure session management
- Regularly audit admin actions
- Implement IP whitelisting for admin access (optional)
- Set up alerts for suspicious admin activities

### 3. Admin Management

- Maintain at least two organization admins for backup
- Regularly review admin access and permissions
- Implement admin activity logging
- Set up automated alerts for critical admin actions
- Create clear procedures for admin password resets

### 4. Domain Management

- Verify domain ownership before allowing domain-based access
- Implement proper DNS validation
- Use SSL certificates for all domains
- Monitor domain activity for security purposes

### 5. User Limits

The system enforces the following limits:
- Maximum 5 regular users per organization
- Maximum 20 read-only users per organization
- One primary organization admin
- Additional admin roles can be assigned as needed

### 6. Audit Trail

All admin actions are logged, including:
- User role changes
- Organization setting updates
- User invitations
- Domain changes
- Subscription changes

## Emergency Access

In case of lost admin access:

1. Use the setup script with new credentials
2. Contact system support for manual verification
3. Follow the account recovery process
4. Maintain backup admin contact information

## Monitoring

Set up monitoring for:
- Failed admin login attempts
- Unusual admin activity patterns
- Domain access patterns
- User limit warnings
- Subscription status

## Regular Maintenance

1. Review admin access monthly
2. Audit user permissions quarterly
3. Update security settings as needed
4. Monitor and adjust user limits based on needs
5. Review and update domain settings

## Development vs Production

### Development
- Use the setup script for quick admin creation
- Use simplified password requirements
- Disable email verification if needed

### Production
- Require full verification process
- Implement all security measures
- Enable comprehensive logging
- Use secure password requirements
- Enable email verification
- Implement 2FA
- Set up proper monitoring

## Troubleshooting

If you encounter issues:

1. Check the logs for error messages
2. Verify environment variables
3. Ensure database connections are working
4. Check domain configurations
5. Verify user permissions

For additional support, contact the system administrator or refer to the technical documentation.
