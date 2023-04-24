import logging

from flask_socketio import emit
from flask import request

from bluff.table.in_memory import TablesInMemory

tables = TablesInMemory()
_logger = logging.getLogger(__name__)


def send_turn_info(is_start: bool = False):
    """
    Sends turn info to all players.
    """
    sid = request.sid  # type: ignore[attr-defined]
    table = tables.get_table_by_sid(sid=sid)
    game = table.game_handler

    for player in game.players:
        if player.sid == game.current_player.sid:
            _logger.info(f"{game.current_player} turn!")
            emit(
                "possible_guesses",
                [game.possible_guesses, is_start],
                room=game.current_player.sid,
            )
        else:
            emit(
                "current_player",
                [
                    game.current_player.username,
                    game.get_turns_until_mine(player),
                ],
                room=player.sid,
            )


def deal_cards():
    """
    Deal cards among players.
    """
    sid = request.sid  # type: ignore[attr-defined]
    table = tables.get_table_by_sid(sid=sid)
    _logger.info(
        "Dealing cards between following players: "
        f"{table.game_handler.players_usernames}"
    )

    for player in table.game_handler.deal_cards():
        emit("hand", list(player.cards), room=player.sid)

    send_turn_info(is_start=True)
