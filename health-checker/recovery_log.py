"""
Writes recovery events to MongoDB so the Admin Module's "View Recovery Logs"
page has something to read. Falls back to a local log file if Mongo is
unreachable, so an event is never silently lost.
"""

import datetime
import json
import logging
import os

from pymongo import MongoClient
from pymongo.errors import PyMongoError

import config

logger = logging.getLogger("self-healing-engine")

_FALLBACK_LOG_PATH = os.getenv("FALLBACK_LOG_PATH", "recovery_events.log")

_client = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is not None:
        return _collection
    try:
        _client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=3000)
        _client.admin.command("ping")  # fail fast if Mongo isn't reachable
        db = _client[config.MONGO_DB_NAME]
        _collection = db[config.RECOVERY_LOG_COLLECTION]
        return _collection
    except PyMongoError as exc:
        logger.error("Could not connect to MongoDB for recovery logging: %s", exc)
        _client = None
        _collection = None
        return None


def record_event(event: str, status: str, details: str = ""):
    """
    event:   'unhealthy_detected' | 'restart_triggered' | 'recovery_verified' | 'recovery_failed'
    status:  'success' | 'failure' | 'info'
    details: free-text explanation
    """
    doc = {
        "timestamp": datetime.datetime.utcnow(),
        "container": config.CONTAINER_NAME,
        "event": event,
        "status": status,
        "details": details,
    }

    collection = _get_collection()
    if collection is not None:
        try:
            collection.insert_one(doc)
            logger.info("Recovery log recorded: %s (%s)", event, status)
            return
        except PyMongoError as exc:
            logger.error("Failed to write recovery log to MongoDB: %s", exc)

    # Fallback: append to a local file so nothing is lost if Mongo is down
    doc["timestamp"] = doc["timestamp"].isoformat() + "Z"
    try:
        with open(_FALLBACK_LOG_PATH, "a") as f:
            f.write(json.dumps(doc) + "\n")
    except OSError as exc:
        logger.error("Failed to write fallback recovery log file: %s", exc)
