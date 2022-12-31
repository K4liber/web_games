from dataclasses import dataclass
import logging
import sys
from flask import Flask, request
from flask_socketio import SocketIO, emit

from bluff.game import Game

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)-8s %(asctime)s] %(message)s (%(name)s)",
    handlers=[
        logging.StreamHandler()
    ]
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
    MAX_PLAYERS = 4
    MIN_PLAYERS = 2


CONST = _Const()
sid_to_username = dict()
game = Game()


@socket.on('connect')
def connect():
    _logger.info(f"[CONNECT]: {request.sid}")


@socket.on('username')
def username(username: str):
    _logger.info(f"[USERNAME]: {request.sid} {username}")
    sid_to_username[request.sid] = username


@socket.on('ready_for_bluff')
def ready_for_bluff(username):
    global game
    current_number_of_players = len(game.players)

    if current_number_of_players == CONST.MAX_PLAYERS:
        _logger.info('To much players!')
    else:
        game.add_player(request.sid, username)
        _logger.info(f'Adding player: {request.sid}')

        for player in game.players:
            emit('ready_players', game.players_usernames, room=player.sid)


@socket.on('start_bluff')
def start_bluff():
    global game

    if game.is_started:
        emit('error', 'Game is already in progress!', room=request.sid)
        return

    if len(game.players) >= CONST.MIN_PLAYERS:
        game.start()
        players_str = '\n'.join([str(player) for player in game.players])
        _logger.info('Starting game between:\n' + players_str + '\n')
        deal_cards()

        for player in game.players:
            emit('progress', f'Starting game between {game.players_usernames}. \
                 There are {game.number_of_cards} cards in play currently!', 
                room=player.sid)
    else:
        emit('error', 'Minimum {CONST.MIN_PLAYERS} players are needed to play.', room=request.sid)

def deal_cards():
    for player in game.deal_cards():
        emit('hand', list(player.cards), room=player.sid)

    _logger.info(f'{game.current_player} turn!')
    emit('possible_guesses', [game.possible_guesses, True], room=game.current_player.sid)


@socket.on('selected')
def selected(selected_guess):
    global game

    if selected_guess == 'check':
        is_in = game.check()
        loser_sid = request.sid if is_in else game.previous_player.sid
        loser_player = game.get_player_by_sid(loser_sid)
        game.finish_round(loser_player)
        have_lost = loser_player not in game.players
        is_finished = len(game.players) == 1

        for player in game.all_starting_players:
            if have_lost:
                emit('progress', f'[{loser_player.username}] is out!', 
                    room=player.sid)

            if is_finished:
                emit('progress', f'[{game.players[0].username}] have won! \
                    Contgratulation!', room=player.sid)
                emit('finished', room=player.sid)
            else:
                deal_cards()
                guessing_player = game.get_player_by_sid(request.sid)
                emit('progress', f'[{loser_player.username}] have lost recently! \
                    Starting next round with {game.number_of_cards} cards in play!', 
                    room=player.sid)
        
        if is_finished:
            game.reset()

        return

    game.set_current_guess(selected_guess)
    guessing_player = game.get_player_by_sid(request.sid)
    info = f'[{guessing_player.username}] having {len(guessing_player.cards)} ' \
            'cards guess:' \
            f"{selected_guess}"

    for player in game.players:
        emit('progress', info, room=player.sid)

    _logger.info(f'{game.current_player} turn!')
    emit('possible_guesses', [game.possible_guesses, False], room=game.current_player.sid)


@socket.on('disconnect')
def disconnect():
    global game
    _logger.info(f"[DISCONNECT]: {request.sid}")

    if request.sid not in sid_to_username:
        _logger.warning(f'Unknown user: {request.sid}')
        return

    disconnected_player = game.get_player_by_sid(request.sid)

    if disconnected_player:
        
        for player in game.players:
            emit('ready_players', [], room=player.sid)
        
        _logger.info(f'Reseting game, {sid_to_username[request.sid]} have left.')
        game.reset()

    for sid in sid_to_username.keys():
        emit('player_disconnected', sid_to_username[request.sid], room=sid)

    del sid_to_username[request.sid]


@socket.on('notify')
def notify(user):
    emit('notify', user, broadcast=True, skip_sid=request.sid)

@socket.on('data')
def data(data):
    emit('returndata', data, broadcast=True)

if __name__ == "__main__":
    socket.run(app)
