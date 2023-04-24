import logging
from typing import Optional

from flask import request
from flask_socketio import emit

from bluff.table import tables_manager

_sid_to_username: dict[str, str] = dict()
_logger = logging.getLogger(__name__)


def load_main_endpoints(socket):
    @socket.on("connect")
    def _connect():
        _logger.info(f"[CONNECT]: {request.sid}")

    @socket.on("username")
    def _on_username(username: str):
        sid = request.sid  # type: ignore[attr-defined]
        _logger.info(f"[USERNAME]: {sid} {username}")
        _sid_to_username[sid] = username

    @socket.on("notify")
    def _notify(user):
        sid = request.sid  # type: ignore[attr-defined]
        table = tables_manager.get_table_by_sid(sid=sid)

        if table is not None:
            for player in table.game_handler.players:
                if player.sid != sid:
                    emit("notify", user, room=player.sid)

    @socket.on("message")
    def _on_data(data):
        sid = request.sid  # type: ignore[attr-defined]
        table = tables_manager.get_table_by_sid(sid=sid)

        if table is not None:
            for player in table.game_handler.players:
                emit("onMessage", data, room=player.sid)

    @socket.on("get_games")
    def _get_games():
        emit(
            "games_list",
            [table.dict for table in tables_manager.get_tables()],
            room=request.sid,
        )


def get_username(sid: str) -> Optional[str]:
    return _sid_to_username.get(sid, None)


def remove_user(sid: str) -> None:
    username = _sid_to_username[sid]
    del _sid_to_username[sid]
    _logger.info(f"[REMOVE USERNAME]: {username}")
