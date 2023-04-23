from dataclasses import dataclass
import logging
from flask import Flask, request
from flask_socketio import SocketIO, emit
from bluff.table.data import TableData
from bluff.table.in_memory import TablesInMemory

from bluff.game import Game

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)-8s %(asctime)s] %(message)s (%(name)s)",
    handlers=[logging.StreamHandler()],
)
_logger = logging.getLogger(__name__)
app = Flask(__name__)
_allowed_origins = [
    "http://localhost",
    "https://localhost",
    "http://localhost:4200",
    "https://localhost:4200",
    "http://192.168.0.164",
    "https://192.168.0.164",
    "http://31.178.189.125",
    "https://31.178.189.125/",
]
socket = SocketIO(app, cors_allowed_origins=_allowed_origins)


@dataclass(frozen=True)
class _Const:
    MAX_PLAYERS = 12
    MIN_PLAYERS = 2


CONST = _Const()
sid_to_username: dict[str, str] = dict()
tables = TablesInMemory()
sid_to_table_name: dict[str, str] = dict()


@socket.on("connect")
def _connect():
    _logger.info(f"[CONNECT]: {request.sid}")


@socket.on("username")
def _on_username(username: str):
    _logger.info(
        f"[USERNAME]: {request.sid} {username}"  # type: ignore[attr-defined]
    )
    sid_to_username[request.sid] = username  # type: ignore[attr-defined]


@socket.on("start_bluff")
def _start_bluff():
    game = tables.get_game(
        table_name=sid_to_table_name[request.sid]  # type: ignore[attr-defined]
    )

    if game.is_started:
        emit("error", "Game is already in progress!", room=request.sid)
        return

    if len(game.players) >= CONST.MIN_PLAYERS:
        game.start()
        players_str = "\n".join([str(player) for player in game.players])
        _logger.info("Starting game between:\n" + players_str + "\n")
        _deal_cards()

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
            "Minimum {CONST.MIN_PLAYERS} players are needed to play.",
            room=request.sid,
        )


def _send_turn_info(is_start: bool = False):
    game = tables.get_game(
        table_name=sid_to_table_name[request.sid]  # type: ignore[attr-defined]
    )

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


def _deal_cards():
    game = tables.get_game(
        table_name=sid_to_table_name[request.sid]  # type: ignore[attr-defined]
    )
    _logger.info(
        "Dealing cards between following players:        "
        f" {game.players_usernames}"
    )

    for player in game.deal_cards():
        emit("hand", list(player.cards), room=player.sid)

    _send_turn_info(is_start=True)


@socket.on("selected")
def _selected(selected_guess):
    game = tables.get_game(
        table_name=sid_to_table_name[request.sid]  # type: ignore[attr-defined]
    )

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
                _deal_cards()
                guessing_player = game.get_player_by_sid(request.sid)
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

    game.set_current_guess(selected_guess)
    guessing_player = game.get_player_by_sid(request.sid)

    if guessing_player is None:
        _logger.warning(f"User with SID = {request.sid} do not play anymore.")
        return

    cards_length = len(guessing_player.cards)
    cards_str = "cards" if cards_length > 1 else "card"
    info = (
        f"[{guessing_player.username}] having {len(guessing_player.cards)} "
        f"{cards_str} guess: {selected_guess}"
    )

    for player in game.players:
        emit("progress", info, room=player.sid)

    _send_turn_info()


@socket.on("disconnect")
def _disconnect():
    sid = request.sid  # type: ignore[attr-defined]
    _logger.info(f"[DISCONNECT]: {sid}")

    if request.sid not in sid_to_username:
        _logger.warning(f"Unknown user: {request.sid}")
        return

    table_name = sid_to_table_name.get(request.sid, None)

    if table_name is None:
        return

    game = tables.get_game(table_name=table_name)
    disconnected_player = game.get_player_by_sid(request.sid)

    if game.is_started and disconnected_player:
        if len(game.players) == 2:
            for player in game.players:
                emit("ready_players", [], room=player.sid)

            game.reset()
        else:
            game.remove_player(disconnected_player)
            _logger.info(f"Player {sid_to_username[request.sid]} have left.")
            _deal_cards()

        info = f"Starting next round with {game.number_of_cards} cards in play!"

        for player in game.players:
            emit(
                "player_disconnected",
                sid_to_username[request.sid],
                room=player.sid,
            )
            emit("progress", info, room=player.sid)

    for sid, _ in sid_to_username.items():
        emit("user_disconnected", sid_to_username[request.sid], room=sid)

    del sid_to_username[request.sid]
    game.remove_player(disconnected_player)

    if len(game.players) == 0:
        tables.remove_table(table_name=table_name)


@socket.on("notify")
def _notify(user):
    emit("notify", user, broadcast=True, skip_sid=request.sid)


@socket.on("data")
def _on_data(data):
    emit("returndata", data, broadcast=True)


@socket.on("get_games")
def _get_games():
    emit(
        "games_list",
        [table.dict for table in tables.get_tables()],
        room=request.sid,
    )


@socket.on("create_game")
def _create_game(table_data):
    _logger.info(f"Creating table: {table_data}")
    sid = request.sid  # type: ignore[attr-defined]
    game = Game()
    table_data = TableData(
        host=request.sid,
        name=table_data["name"],
        max_players=table_data["maxNumberOfPlayers"],
        password=table_data["password"],
        is_public=table_data["isPublic"],
        game=game,
    )
    tables.add_table(table_data=table_data)
    game.add_player(sid, sid_to_username[sid])
    sid_to_table_name[sid] = table_data.name
    emit("join_succeess", [table_data.name, game.players_usernames], room=sid)
    emit(
        "games_list",
        [table.dict for table in tables.get_tables()],
        room=request.sid,
    )


@socket.on("join_game")
def _join_game(table_name: str):
    sid = request.sid  # type: ignore[attr-defined]
    username = sid_to_username[sid]
    _logger.info(f"Player {username} joining table: {table_name}")
    table_data = tables.get_table_data(table_name)
    game = table_data.game

    if game.is_started:
        _logger.info(f"Table {table_name} is already started")
        return

    if len(game.players) >= table_data.max_players:
        _logger.info(f"Table {table_name} is full")
        return

    game.add_player(sid=sid, username=username)
    _logger.info(f"Adding player: {sid}")
    sid_to_table_name[sid] = table_data.name
    emit("join_succeess", [table_data.name, game.players_usernames], room=sid)

    for player in game.players:
        emit("ready_players", game.players_usernames, room=player.sid)


@socket.on("leave")
def _leave():
    sid = request.sid  # type: ignore[attr-defined]
    _logger.info(f"Leaving table: {sid_to_table_name[sid]}")
    table_name = sid_to_table_name.get(sid, None)

    if table_name is None:
        return

    game = tables.get_game(table_name=table_name)
    player = game.get_player_by_sid(sid)
    game.remove_player(player)

    if len(game.players) == 0:
        tables.remove_table(table_name=table_name)
        emit(
            "games_list",
            [table.dict for table in tables.get_tables()],
            room=request.sid,
        )
    else:
        game.reset()

        for player in game.players:
            emit("ready_players", game.players_usernames, room=player.sid)


if __name__ == "__main__":
    socket.run(app)
