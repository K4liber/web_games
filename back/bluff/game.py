import copy
from dataclasses import dataclass
import hashlib
import itertools
import logging
import random
from typing import Optional
from bluff.check import check
from bluff.sequence import SEQUENCE


_logger = logging.getLogger(__name__)
_colors = [
    'spades',
    'clubs',
    'diamonds',
    'hearts'
]
_figure_int_to_str = {x: str(x) for x in range (9, 11)}
_figure_int_to_str.update({
    11: 'jack',
    12: 'queen',
    13: 'king',
    14: 'ace'
})
_all_cards = list(itertools.product(list(_figure_int_to_str.values()), _colors))
_sequences_hierarchy = []
_sequences_hierarchy += [
    f'{SEQUENCE.HIGH_CARD} {_figure_int_to_str[figure]}' for figure in range(9, 15)
]
_sequences_hierarchy += [
    f'{SEQUENCE.ONE_PAIR} {_figure_int_to_str[figure]}' for figure in range(9, 15)
]
_sequences_hierarchy += [
    f'{SEQUENCE.TWO_PAIR} {_figure_int_to_str[figure]};{_figure_int_to_str[figure_2]}' 
        for figure in range(9, 15) 
        for figure_2 in range(9, 15)
    if figure > figure_2
]
_sequences_hierarchy += [
    f'{SEQUENCE.SMALL_STRAIGHT}',
    f'{SEQUENCE.BIG_STRAIGHT}'
]
_sequences_hierarchy += [
    f'{SEQUENCE.THREE_OF_A_KIND} {_figure_int_to_str[figure]}' for figure in range(9, 15)
]
_sequences_hierarchy += [
    f'{SEQUENCE.FULL} {_figure_int_to_str[figure]};{_figure_int_to_str[figure_2]}' 
        for figure in range(9, 15) 
        for figure_2 in range(9, 15)
    if figure > figure_2
]
_sequences_hierarchy += [
    f'{SEQUENCE.FULL} {_figure_int_to_str[figure]};{_figure_int_to_str[figure_2]}' 
        for figure in range(9, 15) 
        for figure_2 in range(9, 15)
    if figure < figure_2
]
_sequences_hierarchy += [
    f'{SEQUENCE.COLOR} {color}' for color in _colors
]
_sequences_hierarchy += [
    f'{SEQUENCE.FOUR_OF_A_KIND} {_figure_int_to_str[figure]}' for figure in range(9, 15)
]
_sequences_hierarchy += [
    f'{SEQUENCE.SMALL_POKER} {color}' for color in _colors
]
_sequences_hierarchy += [
    f'{SEQUENCE.BIG_POKER} {color}' for color in _colors
]


@dataclass()
class Player:
    sid: str
    username: str
    cards: set[tuple[str, str]]

    def __str__(self):
        return f'<SID: {self.sid}, USERNAME: {self.username}>'
    
    def __hash__(self):
        return int(hashlib.sha256(self.sid.encode('utf-8')).hexdigest(), 16) % 10**8


class Game:
    def __init__(self):
        self.reset()

    def reset(self):
        self._all_starting_players: list[Player] = []
        self._cards_deck = self._shuffle()
        self._is_started = False
        self._player_to_number_of_cards = dict()
        self._players: list[Player] = []
        self._current_guess: Optional[int] = None
        self._current_player: Optional[int] = None
        self._player_sid_to_username = dict()

    @property
    def is_started(self) -> bool:
        return self._is_started

    @property
    def players(self) -> list[Player]:
        return self._players

    @property
    def current_player(self) -> Player:
        return self._players[self._current_player]

    @property
    def previous_player(self) -> Player:
        previous_player_index = (self._current_player - 1) % len(self._players)
        return self._players[previous_player_index]

    @property
    def number_of_cards(self) -> int:
        all_cards = 0

        for player in self._players:
            all_cards += len(player.cards)
        
        return all_cards

    @property
    def players_usernames(self) -> list[str]:
        return [player.username for player in self._players]

    @property
    def max_cards(self) -> int:
        return min(5, int(24 / len(self._players)))

    def finish_round(self, loser_player: Player):
        self._player_to_number_of_cards[loser_player] = \
            self._player_to_number_of_cards[loser_player] + 1

        if self._player_to_number_of_cards[loser_player] > self.max_cards:
            self.remove_player(loser_player.sid)

        self._current_player = (self._current_player + 1) % len(self._players)
        self._current_guess = None

    def get_player_by_sid(self, sid: str) -> Optional[Player]:
        for player in self._players:
            if player.sid == sid:
                return player

    def set_current_guess(self, guess: str):
        self._current_guess = _sequences_hierarchy.index(guess)
        self._current_player = (self._current_player + 1) % len(self._players)

    def check(self) -> bool:
        '''
        Return True if check is correct
        '''
        all_cards_in_play = set()

        for player in self._players:
            all_cards_in_play.update(player.cards)

        return check(
            _sequences_hierarchy[self._current_guess], 
            all_cards_in_play
        )

    def add_player(self, sid: str, username: str):
        self._players.append(Player(sid=sid, username=username, cards=set()))

    def remove_player(self, player_sid: str):
        player = self.get_player_by_sid(player_sid)

        if player:
            self._players.remove(player)
            del self._player_to_number_of_cards[player]

    @property
    def possible_guesses(self):
        if self._current_guess is None:
            return _sequences_hierarchy

        next_in_hierarchy = self._current_guess + 1

        if next_in_hierarchy >= len(_sequences_hierarchy):
            return []
        else:
            return _sequences_hierarchy[next_in_hierarchy:]

    @property
    def all_starting_players(self) -> list[Player]:
        return self._all_starting_players

    def start(self):
        self._player_to_number_of_cards = {
            player: 1 for player in self._players
        }
        self._is_started = True
        self._current_player = 0
        self._all_starting_players = copy.deepcopy(self._players)
        
    def _shuffle(self) -> list[tuple[str, str]]:
        return random.sample(_all_cards, len(_all_cards))
    
    def deal_cards(self) -> list[Player]:
        self._cards_deck = self._shuffle()

        for player in self._players:
            number_of_cards = self._player_to_number_of_cards[player]
            player.cards = set()

            for _ in range(number_of_cards):
                player.cards.add(self._cards_deck.pop(0))

        return self._players
