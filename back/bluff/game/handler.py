import copy
import random
from typing import Optional
import logging

from bluff.game.check import CheckSet, check
from bluff.game.card import get_all_cards, get_sequence_hierarchy
from bluff.game.player import Player


_sequences_hierarchy = get_sequence_hierarchy()
_all_cards = get_all_cards()
_logger = logging.getLogger(__name__)


class GameHandler:
    """
    Game handler.
    """

    def __init__(self):
        self._all_starting_players: list[Player] = []
        self._cards_deck = self._shuffle()
        self._is_started = False
        self._players: list[Player] = []
        self._current_guess_index: Optional[int] = None
        self._current_player_index: Optional[int] = None
        self._player_sid_to_username: dict[str, int] = dict()

    def reset(self, reset_players: bool = True) -> None:
        self._all_starting_players = []
        self._cards_deck = self._shuffle()
        self._is_started = False

        if reset_players:
            self._players = []
            self._player_sid_to_username = dict()

        self._current_guess_index = None
        self._current_player_index = None

    @property
    def is_started(self) -> bool:
        return self._is_started

    @property
    def players(self) -> list[Player]:
        return self._players

    @property
    def current_player(self) -> Player:
        return self._players[self._current_player_index]

    @property
    def previous_player(self) -> Player:
        previous_player_index = (self._current_player_index - 1) % len(
            self._players
        )
        return self._players[previous_player_index]

    @property
    def next_player(self) -> Player:
        previous_player_index = (self._current_player_index + 1) % len(
            self._players
        )
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
    def _max_cards(self) -> int:
        return min(5, int(24 / len(self._players)))

    def finish_round(self, loser_player: Player):
        next_starting_player_index = (
            self._players.index(loser_player) + 1
        ) % len(self._players)
        next_starting_player = self._players[next_starting_player_index]
        loser_player.number_of_cards += 1

        if loser_player.number_of_cards > self._max_cards:
            self.remove_player(loser_player)

        self._current_player_index = self._players.index(next_starting_player)
        self._current_guess_index = None

    def get_player_by_sid(self, sid: str) -> Optional[Player]:
        for player in self._players:
            if player.sid == sid:
                return player

        return None

    @property
    def current_guess(self) -> str:
        return _sequences_hierarchy[self._current_guess_index]

    def set_current_guess(self, guess: str):
        self._current_guess_index = _sequences_hierarchy.index(guess)
        self._current_player_index = (self._current_player_index + 1) % len(
            self._players
        )

    def check(self) -> bool:
        """
        Return True if check is correct
        """
        all_cards_in_play = set()

        for player in self._players:
            all_cards_in_play.update(player.cards)

        return check(
            CheckSet(
                sequence=_sequences_hierarchy[self._current_guess_index],
                cards=all_cards_in_play,
            )
        )

    def add_player(self, sid: str, username: str):
        if sid in {player.sid for player in self._players}:
            raise ValueError(f'SID "{sid}" already in the game.')

        self._players.append(Player(sid=sid, username=username, cards=set()))

    def remove_player(self, player: Player):
        if player not in self._players:
            _logger.warning(f'Player "{player}" not in the game.')
            return

        player_index = self._players.index(player)
        self._players.remove(player)

        if player_index == self._current_player_index:
            self._current_player_index = self._players.index(self.next_player)

    @property
    def possible_guesses(self):
        if self._current_guess_index is None:
            return _sequences_hierarchy

        next_in_hierarchy = self._current_guess_index + 1

        if next_in_hierarchy >= len(_sequences_hierarchy):
            return []

        return _sequences_hierarchy[next_in_hierarchy:]

    @property
    def all_starting_players(self) -> list[Player]:
        return self._all_starting_players

    def start(self):
        for player in self._players:
            player.number_of_cards = 1

        self._is_started = True
        self._current_player_index = 0
        self._all_starting_players = copy.deepcopy(self._players)

    def _shuffle(self) -> list[tuple[str, str]]:
        return random.sample(_all_cards, len(_all_cards))

    def deal_cards(self) -> list[Player]:
        self._cards_deck = self._shuffle()

        for player in self._players:
            player.cards = set()

            for _ in range(player.number_of_cards):
                player.cards.add(self._cards_deck.pop(0))

        return self._players

    def get_turns_until_mine(self, player: Player) -> int:
        my_index = self._players.index(player)

        if my_index >= self._current_player_index:
            return my_index - self._current_player_index

        return my_index + len(self._players) - self._current_player_index
