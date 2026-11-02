import logging
import sys

FORMAT = "%(levelname)-8s %(name)s: %(message)s"


def configure_logging(level: int = logging.INFO) -> None:
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(logging.Formatter(FORMAT))

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)

    # INFO here echoes every SQL statement and buries everything else.
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
