import logging


def load_logging_config():
    """
    Loads logging configuration
    """
    logging.basicConfig(
        level=logging.INFO,
        format="[%(levelname)-8s %(asctime)s] %(message)s (%(name)s)",
        handlers=[logging.StreamHandler()],
    )
