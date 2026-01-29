import json
import os
import time
from cryptography.fernet import Fernet
import base64

CONNECTIONS_PATH = os.path.join(os.path.dirname(__file__), "config", "db_connections.json")
KEY_PATH = os.path.join(os.path.dirname(__file__), "config", ".encryption_key")

# Fields that should be encrypted
ENCRYPTED_FIELDS = ['password', 'dsn']

def get_or_create_key():
    """Get or create encryption key"""
    if os.path.exists(KEY_PATH):
        with open(KEY_PATH, "rb") as f:
            return f.read()
    else:
        key = Fernet.generate_key()
        # Create config directory if it doesn't exist
        os.makedirs(os.path.dirname(KEY_PATH), exist_ok=True)
        with open(KEY_PATH, "wb") as f:
            f.write(key)
        return key

def get_cipher():
    """Get Fernet cipher instance"""
    key = get_or_create_key()
    return Fernet(key)

def encrypt_value(value):
    """Encrypt a string value"""
    if not value:
        return value
    cipher = get_cipher()
    encrypted = cipher.encrypt(value.encode())
    return base64.b64encode(encrypted).decode()

def decrypt_value(encrypted_value):
    """Decrypt an encrypted string value"""
    if not encrypted_value:
        return encrypted_value
    try:
        cipher = get_cipher()
        decoded = base64.b64decode(encrypted_value.encode())
        decrypted = cipher.decrypt(decoded)
        return decrypted.decode()
    except Exception:
        # If decryption fails, assume it's plain text (for backward compatibility)
        return encrypted_value

def encrypt_connection_details(details):
    """Encrypt sensitive fields in connection details"""
    encrypted_details = details.copy()
    for field in ENCRYPTED_FIELDS:
        if field in encrypted_details and encrypted_details[field]:
            encrypted_details[field] = encrypt_value(encrypted_details[field])
    return encrypted_details

def decrypt_connection_details(details):
    """Decrypt sensitive fields in connection details"""
    decrypted_details = details.copy()
    for field in ENCRYPTED_FIELDS:
        if field in decrypted_details and decrypted_details[field]:
            decrypted_details[field] = decrypt_value(decrypted_details[field])
    return decrypted_details

def get_config():
    """Get the entire configuration including connections and settings"""
    if not os.path.exists(CONNECTIONS_PATH):
        return {
            "oracle": {},
            "postgresql": {},
            "mysql": {},
            "sqlserver": {},
            "settings": {"batch_size": 100000}
        }
    
    with open(CONNECTIONS_PATH, "r") as f:
        config = json.load(f)
    
    # Ensure settings exist with defaults
    if "settings" not in config:
        config["settings"] = {"batch_size": 100000}
    
    return config

def save_config(config):
    """Save the entire configuration"""
    with open(CONNECTIONS_PATH, "w") as f:
        json.dump(config, f, indent=4)

def get_all_connections():
    config = get_config()
    # Return only the database connections, not settings - decrypt passwords
    decrypted_connections = {}
    for db_type in ["oracle", "postgresql", "mysql", "sqlserver"]:
        decrypted_connections[db_type] = {}
        for conn_name, conn_details in config.get(db_type, {}).items():
            decrypted_connections[db_type][conn_name] = decrypt_connection_details(conn_details)
    return decrypted_connections

def save_connection(name, db_type, details):
    config = get_config()
    if db_type not in config:
        config[db_type] = {}
    # Optionally set/update last_used
    details["last_used"] = time.strftime("%Y-%m-%d %H:%M:%S")
    # Encrypt sensitive fields before saving
    encrypted_details = encrypt_connection_details(details)
    config[db_type][name] = encrypted_details
    save_config(config)

def delete_connection(name):
    config = get_config()
    modified = False
    for db_type in ["oracle", "postgresql", "mysql", "sqlserver"]:
        if db_type in config and name in config[db_type]:
            del config[db_type][name]
            modified = True
    if modified:
        save_config(config)

def get_connection_by_name(name):
    all_conns = get_all_connections()  # Already decrypted
    for db_type, dbs in all_conns.items():
        if name in dbs:
            db_details = dbs[name].copy()
            db_details["type"] = db_type
            # Optionally update last_used (for auditing)
            db_details["last_used_access"] = time.strftime("%Y-%m-%d %H:%M:%S")
            return db_details
    raise Exception("No such connection: %s" % name)

def get_connection_by_type_and_name(db_type, name):
    all_conns = get_all_connections()  # Already decrypted
    if db_type in all_conns and name in all_conns[db_type]:
        db_details = all_conns[db_type][name].copy()
        db_details["type"] = db_type
        db_details["last_used_access"] = time.strftime("%Y-%m-%d %H:%M:%S")
        return db_details
    raise Exception("No such connection %s of type %s" % (name, db_type))
