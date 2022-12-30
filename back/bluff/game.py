import copy
from dataclasses import dataclass
import hashlib
import itertools
import random
from typing import Optional


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
    f'High card {_figure_int_to_str[figure]}' for figure in range(9, 15)
]
_sequences_hierarchy += [
    f'One pair {_figure_int_to_str[figure]}' for figure in range(9, 15)
]
_sequences_hierarchy += [
    f'Two pair {_figure_int_to_str[figure]};{_figure_int_to_str[figure_2]}' 
        for figure in range(9, 15) 
        for figure_2 in range(9, 15)
    if figure > figure_2
]
_sequences_hierarchy += [
    'Small straight',
    'Big straight'
]
_sequences_hierarchy += [
    f'Three of a kind {_figure_int_to_str[figure]}' for figure in range(9, 15)
]
_sequences_hierarchy += [
    f'Full 3x2 {_figure_int_to_str[figure]};{_figure_int_to_str[figure_2]}' 
        for figure in range(9, 15) 
        for figure_2 in range(9, 15)
    if figure > figure_2
]
_sequences_hierarchy += [
    f'Full 3x2 {_figure_int_to_str[figure]};{_figure_int_to_str[figure_2]}' 
        for figure in range(9, 15) 
        for figure_2 in range(9, 15)
    if figure < figure_2
]
_sequences_hierarchy += [
    f'Color {color}' for color in _colors
]
_sequences_hierarchy += [
    f'Four of a kind {_figure_int_to_str[figure]}' for figure in range(9, 15)
]
_sequences_hierarchy += [
    f'Small poker {color}' for color in _colors
]
_sequences_hierarchy += [
    f'Big poker {color}' for color in _colors
]
# TODO finish the hierarchy and is_sequence_in_cards function


def is_sequence_in_cards(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    print(f'Checking sequence: {sequence}')
    cards_str = "\n".join([str(card) for card in cards])
    print('Available cards: \n' + cards_str + '\n')

    if sequence.startswith('High card'):
        high_card = sequence.removeprefix('High card ')

        for card in cards:
            figure = card[0]

            if high_card == figure:
                print(f'Sequence {sequence} is in cards!')
                return True
        
        return False

    if sequence.startswith('One pair'):
        pair = sequence.removeprefix('One pair ')
        number_of_cards = 0

        for card in cards:
            figure = card[0]

            if pair == figure:
                number_of_cards += 1
            
            if number_of_cards == 2:
                print(f'Sequence {sequence} is in cards!')
                return True
        
        return False

    if sequence.startswith('Two pair'):
        pair = sequence.removeprefix('Two pair ')
        first_figure, second_figure = pair.split(';')
        first_figure_count = 0
        second_figure_count = 0

        for card in cards:
            figure = card[0]

            if first_figure == figure:
                first_figure_count += 1
            
            elif second_figure == figure:
                second_figure_count += 1

            if first_figure_count >= 2 and second_figure_count >= 2:
                print(f'Sequence {sequence} is in cards!')
                return True
        
        return False

    if sequence == 'Small straight':
        _needed_figure_to_count = {
            '9': 0,
            '10': 0,
            'jack': 0,
            'queen': 0,
            'king': 0
        }

        for card in cards:
            figure = card[0]

            if figure in _needed_figure_to_count:
                _needed_figure_to_count[figure] += 1
            
        if all(list(_needed_figure_to_count.values())):
            print(f'Sequence {sequence} is in cards!')
            return True

        return False
    
    if sequence == 'Big straight':
        _needed_figure_to_count = {
            '10': 0,
            'jack': 0,
            'queen': 0,
            'king': 0,
            'ace': 0
        }

        for card in cards:
            figure = card[0]

            if figure in _needed_figure_to_count:
                _needed_figure_to_count[figure] += 1
            
        if all(list(_needed_figure_to_count.values())):
            print(f'Sequence {sequence} is in cards!')
            return True

        return False

    if sequence.startswith('Three of a kind'):
        needed_figure = sequence.removeprefix('Three of a kind ')
        number_of_cards = 0

        for card in cards:
            figure = card[0]

            if needed_figure == figure:
                number_of_cards += 1
            
            if number_of_cards == 3:
                print(f'Sequence {sequence} is in cards!')
                return True
        
        return False

    if sequence.startswith('Full 3x2'):
        pair = sequence.removeprefix('Full 3x2 ')
        first_figure, second_figure = pair.split(';')
        first_figure_count = 0
        second_figure_count = 0

        for card in cards:
            figure = card[0]

            if first_figure == figure:
                first_figure_count += 1
            
            elif second_figure == figure:
                second_figure_count += 1

            if first_figure_count >= 3 and second_figure_count >= 2:
                print(f'Sequence {sequence} is in cards!')
                return True
        
        return False

    if sequence.startswith('Color'):
        needed_color = sequence.removeprefix('Color ')
        number_of_cards = 0

        for card in cards:
            color = card[1]

            if needed_color == color:
                number_of_cards += 1
            
            if number_of_cards == 5:
                print(f'Sequence {sequence} is in cards!')
                return True
        
        return False

    if sequence.startswith('Four of a kind'):
        needed_figure = sequence.removeprefix('Four of a kind ')
        number_of_cards = 0

        for card in cards:
            figure = card[0]

            if needed_figure == figure:
                number_of_cards += 1
            
            if number_of_cards == 4:
                print(f'Sequence {sequence} is in cards!')
                return True
        
        return False

    if sequence.startswith('Small poker'):
        needed_color = sequence.removeprefix('Small poker ')
        _needed_figure_to_count = {
            '9': 0,
            '10': 0,
            'jack': 0,
            'queen': 0,
            'king': 0
        }

        for card in cards:
            figure = card[0]
            color = card[1]

            if figure in _needed_figure_to_count and color == needed_color:
                _needed_figure_to_count[figure] += 1
            
        if all(list(_needed_figure_to_count.values())):
            print(f'Sequence {sequence} is in cards!')
            return True

        return False
    
    if sequence.startswith('Big poker'):
        needed_color = sequence.removeprefix('Big poker ')
        _needed_figure_to_count = {
            '10': 0,
            'jack': 0,
            'queen': 0,
            'king': 0,
            'ace': 0
        }

        for card in cards:
            figure = card[0]
            color = card[1]

            if figure in _needed_figure_to_count and color == needed_color:
                _needed_figure_to_count[figure] += 1
            
        if all(list(_needed_figure_to_count.values())):
            print(f'Sequence {sequence} is in cards!')
            return True

        return False

    return False


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
    def number_of_cards(self) -> int:
        all_cards = 0

        for player in self._players:
            all_cards += len(player.cards)
        
        return all_cards

    def finish_round(self, loser_player: Player):
        self._player_to_number_of_cards[loser_player] = \
            self._player_to_number_of_cards[loser_player] + 1

        if self._player_to_number_of_cards[loser_player] > 5:
            self.remove_player(loser_player.sid)
        else:
            player_index = self._players.index(loser_player)
            self._current_player = (player_index + 1) % len(self._players)
        
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

        return is_sequence_in_cards(
            _sequences_hierarchy[self._current_guess], 
            all_cards_in_play
        )

    def add_player(self, sid: str, username: str):
        self._players.append(Player(sid=sid, username=username, cards=set()))

    def stop(self):
        self._is_started = False

    def remove_player(self, player_sid: str):
        player = self.get_player_by_sid(player_sid)

        if player:
            self._players.remove(player)

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
            player: 2 for player in self._players
        }
        self._is_started = True
        self._current_player = 0
        self._all_starting_players = copy.deepcopy(self._players)
        
    def _shuffle(self) -> list[tuple[str, str]]:
        return random.sample(_all_cards, len(_all_cards))
    
    def deal_cards(self) -> list[Player]:
        self._cards_deck = self._shuffle()

        for player, number_of_cards in self._player_to_number_of_cards.items():
            player.cards = set()

            for _ in range(number_of_cards):
                player.cards.add(self._cards_deck.pop(0))

        return self._players
