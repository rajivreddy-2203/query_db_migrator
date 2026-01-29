# Connection Encryption Guide

## Overview
All sensitive connection details (passwords, DSN strings) are now encrypted in `db_connections.json` using Fernet symmetric encryption.

## How It Works

1. **Encryption Key**: A unique encryption key is automatically generated and stored in `config/.encryption_key`
2. **Automatic Encryption**: When you save a connection, passwords and DSN strings are encrypted before being written to disk
3. **Automatic Decryption**: When connections are loaded, sensitive fields are decrypted transparently
4. **Backward Compatible**: The system can detect and handle plain text passwords (for migration)

## Security Features

✓ Passwords are never stored in plain text  
✓ Encryption key is auto-generated and unique per installation  
✓ Key file is excluded from version control (.gitignore)  
✓ Uses industry-standard Fernet encryption (AES-128)  

## Setup Instructions

### For New Installations
No action needed! Encryption is automatic.

### For Existing Installations
1. Install the new dependency:
   ```bash
   pip install cryptography
   ```

2. Run the migration script to encrypt existing passwords:
   ```bash
   python encrypt_existing_data.py
   ```

3. Verify your connections still work after encryption

## Important Notes

⚠️ **Backup Your Key**: The `config/.encryption_key` file is critical. If lost, you cannot decrypt existing passwords.

⚠️ **Never Commit the Key**: The `.encryption_key` file is in `.gitignore` - keep it that way!

⚠️ **Key Portability**: If moving the application to another server, you must copy the `.encryption_key` file along with `db_connections.json`, or you'll need to re-enter all passwords.

## Encrypted Fields

The following fields are encrypted:
- `password` (all database types)
- `dsn` (Oracle connections)

All other fields (host, port, database, user) remain in plain text for easier troubleshooting.

## Troubleshooting

**Q: I lost my encryption key. What do I do?**  
A: Delete the `config/.encryption_key` file and `db_connections.json`. A new key will be generated, but you'll need to re-enter all connection details.

**Q: Can I see the decrypted passwords?**  
A: The UI masks passwords with asterisks. When editing a connection, the password field will be populated but displayed as dots. To see the actual value, you would need to temporarily change the input type from "password" to "text" in the browser's developer tools.

**Q: How do I back up my connections?**  
A: Back up both `config/db_connections.json` AND `config/.encryption_key` together. Both files are required to restore encrypted connections.
