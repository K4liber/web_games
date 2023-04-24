import logging

from flask import Flask, request
from flask_socketio import SocketIO, emit

from bluff.socket.common import deal_cards, send_turn_info
from bluff.socket.main import get_username, load_main_endpoints, remove_user
from bluff.table.data import TableData
from bluff.table import tables_manager
from bluff.game.handler import GameHandler


_logger = logging.getLogger(__name__)
app = Flask(__name__)
socket = SocketIO(
    app=app,
    cors_allowed_origins=[
        "http://localhost",
        "https://localhost",
        "http://localhost:4200",
        "https://localhost:4200",
        "http://192.168.0.164",
        "https://192.168.0.164",
        "http://31.178.189.125",
        "https://31.178.189.125/",
    ],
)
load_main_endpoints(socket=socket)


@socket.on("start_bluff")
def _start_bluff():
    sid = request.sid  # type: ignore[attr-defined]
    table = tables_manager.get_table_by_sid(sid=sid)
    game = table.game_handler

    if game.is_started:
        emit("error", "Game is already in progress!", room=request.sid)
        return

    if len(game.players) >= 2:
        game.start()
        players_str = "\n".join([str(player) for player in game.players])
        _logger.info("Starting game between:\n" + players_str + "\n")
        deal_cards()

        for player in game.players:
            emit(
                "progress",
                (
                    f"Starting game between {game.players_usernames}.          "
                    f"       There are {game.number_of_cards} cards in play"
                    " currently!"
                ),
                room=player.sid,
            )
    else:
        emit(
            "error",
            "Minimum 2 players are needed to play.",
            room=request.sid,
        )


def _handle_guess(selected_guess: str, game: GameHandler):
    sid = request.sid  # type: ignore[attr-defined]
    game.set_current_guess(selected_guess)
    guessing_player = game.get_player_by_sid(sid)

    if guessing_player is None:
        _logger.warning(f"User with SID = {sid} do not play anymore.")
        return

    cards_length = len(guessing_player.cards)
    cards_str = "cards" if cards_length > 1 else "card"
    info = (
        f"[{guessing_player.username}] having {len(guessing_player.cards)} "
        f"{cards_str} guess: {selected_guess}"
    )

    for player in game.players:
        emit("progress", info, room=player.sid)

    send_turn_info()


@socket.on("selected")
def _selected(selected_guess):
    sid = request.sid  # type: ignore[attr-defined]
    table = tables_manager.get_table_by_sid(sid=sid)

    if table is None:
        _logger("Table no longer exists.")
        return

    game = table.game_handler

    if selected_guess == "check":
        is_in = game.check()
        checking_player = game.get_player_by_sid(request.sid)
        last_sequence = game.current_guess
        loser_sid = request.sid if is_in else game.previous_player.sid
        loser_player = game.get_player_by_sid(loser_sid)
        players_cards = [
            (player.username, list(player.cards)) for player in game.players
        ]
        game.finish_round(loser_player)
        have_lost = loser_player not in game.players
        is_finished = len(game.players) == 1

        for player in game.all_starting_players:
            if have_lost:
                emit(
                    "progress",
                    f"[{loser_player.username}] is out!",
                    room=player.sid,
                )

            if is_finished:
                emit(
                    "progress",
                    f"[{game.players[0].username}] have won! Congratulation!",
                    room=player.sid,
                )
                emit("finished", room=player.sid)
            else:
                summary = (
                    f"Player [{checking_player.username}] have checked"
                    " sequence "
                    + f'"{last_sequence}". Player [{loser_player.username}] '
                    + "lost that round."
                )
                emit("summary", summary, room=player.sid)
                deal_cards()
                emit(
                    "progress",
                    (
                        f"[{loser_player.username}] have lost recently!"
                        " Starting next round with"
                        f" {game.number_of_cards} cards in play!"
                    ),
                    room=player.sid,
                )

            emit("players_cards", players_cards, room=player.sid)

        if is_finished:
            game.reset()

        return

    _handle_guess(selected_guess=selected_guess, game=game)


@socket.on("disconnect")
def _disconnect():
    sid = request.sid  # type: ignore[attr-defined]
    _logger.info(f"[DISCONNECT]: {sid}")
    username = get_username(sid)

    if username is None:
        _logger.warning(f"Unknown user: {request.sid}")
        return

    table = tables_manager.get_table_by_sid(sid)

    if table is None:
        return

    game = table.game_handler
    disconnected_player = game.get_player_by_sid(request.sid)

    if game.is_started and disconnected_player:
        if len(game.players) == 2:
            for player in game.players:
                emit("ready_players", [], room=player.sid)

            game.reset()
        else:
            game.remove_player(disconnected_player)
            _logger.info(f"Player {username} have left.")
            deal_cards()

        info = f"Starting next round with {game.number_of_cards} cards in play!"

        for player in game.players:
            emit(
                "player_disconnected",
                username,
                room=player.sid,
            )
            emit("progress", info, room=player.sid)

    for player in game.players:
        emit("user_disconnected", player.username, room=player.sid)

    remove_user(sid)
    game.remove_player(disconnected_player)

    if len(game.players) == 0:
        tables_manager.remove_table(table_name=table.name)


@socket.on("create_game")
def _create_game(table_data):
    _logger.info(f"Creating table: {table_data}")
    sid = request.sid  # type: ignore[attr-defined]
    game = GameHandler()
    table_data = TableData(
        host=request.sid,
        name=table_data["name"],
        max_players=table_data["maxNumberOfPlayers"],
        password=table_data["password"],
        is_public=table_data["isPublic"],
        game_handler=game,
    )
    username = get_username(sid)
    tables_manager.add_table(table_data=table_data)
    game.add_player(sid, username)
    tables_manager.add_user_to_table(table=table_data, sid=sid)
    emit("join_succeess", [table_data.name, game.players_usernames], room=sid)
    emit(
        "games_list",
        [table.dict for table in tables_manager.get_tables()],
        room=request.sid,
    )


@socket.on("join_game")
def _join_game(table_name: str):
    sid = request.sid  # type: ignore[attr-defined]
    username = get_username(sid)
    _logger.info(f"Player {username} joining table: {table_name}")
    table_data = tables_manager.get_table_data(table_name)
    game = table_data.game_handler

    if game.is_started:
        _logger.info(f"Table {table_name} is already started")
        return

    if len(game.players) >= table_data.max_players:
        _logger.info(f"Table {table_name} is full")
        emit("error", "Table is full. Please refresh the list.", room=sid)
        return

    game.add_player(sid=sid, username=username)
    _logger.info(f"Adding player: {sid}")
    tables_manager.add_user_to_table(table=table_data, sid=sid)
    emit("join_succeess", [table_data.name, game.players_usernames], room=sid)

    for player in game.players:
        if player.sid != sid:
            emit("notify", username + " joined!", room=player.sid)

        emit("ready_players", game.players_usernames, room=player.sid)


@socket.on("leave")
def _leave():
    sid = request.sid  # type: ignore[attr-defined]
    table = tables_manager.get_table_by_sid(sid)

    if table is None:
        return

    game = table.game_handler
    player = game.get_player_by_sid(sid)
    _logger.info(f'Player "{player.username}" leaving table "{table.name}"')
    game.remove_player(player)

    if len(game.players) == 0:
        _logger.info(f'Removing table "{table.name}"')
        tables_manager.remove_table(table_name=table.name)
        emit(
            "games_list",
            [table.dict for table in tables_manager.get_tables()],
            room=request.sid,
        )
    else:
        game.reset(reset_players=False)

        for player in game.players:
            emit("ready_players", game.players_usernames, room=player.sid)


if __name__ == "__main__":
    socket.run(app)
