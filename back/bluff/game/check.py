from dataclasses import dataclass
import logging
import re
from typing import Callable

from bluff.game.card import SEQUENCE

_logger = logging.getLogger(__name__)


@dataclass
class CheckSet:
    """
    All necessary data to evaluate a check move.
    """

    sequence: str
    cards: set[tuple[str, str]]


def _remove_prefix(sequence: str):
    match = re.search(r"\[.*?]", sequence)
    sequence_type = match.group(0)
    return sequence.removeprefix(f"{sequence_type} ")


def _high_card(check_set: CheckSet) -> bool:
    high_card = _remove_prefix(check_set.sequence)

    for card in check_set.cards:
        figure = card[0]

        if high_card == figure:
            return True

    return False


def _one_pair(check_set: CheckSet) -> bool:
    pair = _remove_prefix(check_set.sequence)
    number_of_cards = 0

    for card in check_set.cards:
        figure = card[0]

        if pair == figure:
            number_of_cards += 1

        if number_of_cards == 2:
            return True

    return False


def _two_pair(check_set: CheckSet) -> bool:
    pair = _remove_prefix(check_set.sequence)
    first_figure, second_figure = pair.split(";")
    first_figure_count = 0
    second_figure_count = 0

    for card in check_set.cards:
        figure = card[0]

        if first_figure == figure:
            first_figure_count += 1

        elif second_figure == figure:
            second_figure_count += 1

        if first_figure_count >= 2 and second_figure_count >= 2:
            return True

    return False


def _small_straight(check_set: CheckSet) -> bool:
    _needed_figure_to_count = {
        "9": 0,
        "10": 0,
        "jack": 0,
        "queen": 0,
        "king": 0,
    }

    for card in check_set.cards:
        figure = card[0]

        if figure in _needed_figure_to_count:
            _needed_figure_to_count[figure] += 1

    if all(list(_needed_figure_to_count.values())):
        return True

    return False


def _big_straight(check_set: CheckSet) -> bool:
    _needed_figure_to_count = {
        "10": 0,
        "jack": 0,
        "queen": 0,
        "king": 0,
        "ace": 0,
    }

    for card in check_set.cards:
        figure = card[0]

        if figure in _needed_figure_to_count:
            _needed_figure_to_count[figure] += 1

    if all(list(_needed_figure_to_count.values())):
        return True

    return False


def _three_of_a_kind(check_set: CheckSet) -> bool:
    needed_figure = _remove_prefix(check_set.sequence)
    number_of_cards = 0

    for card in check_set.cards:
        figure = card[0]

        if needed_figure == figure:
            number_of_cards += 1

        if number_of_cards == 3:
            return True

    return False


def _full(check_set: CheckSet) -> bool:
    pair = _remove_prefix(check_set.sequence)
    first_figure, second_figure = pair.split(";")
    first_figure_count = 0
    second_figure_count = 0

    for card in check_set.cards:
        figure = card[0]

        if first_figure == figure:
            first_figure_count += 1

        elif second_figure == figure:
            second_figure_count += 1

        if first_figure_count >= 3 and second_figure_count >= 2:
            return True

    return False


def _color(check_set: CheckSet) -> bool:
    needed_color = _remove_prefix(check_set.sequence)
    number_of_cards = 0

    for card in check_set.cards:
        color = card[1]

        if needed_color == color:
            number_of_cards += 1

        if number_of_cards == 5:
            return True

    return False


def _four_of_a_kind(check_set: CheckSet) -> bool:
    needed_figure = _remove_prefix(check_set.sequence)
    number_of_cards = 0

    for card in check_set.cards:
        figure = card[0]

        if needed_figure == figure:
            number_of_cards += 1

        if number_of_cards == 4:
            return True

    return False


def _small_poker(check_set: CheckSet) -> bool:
    needed_color = _remove_prefix(check_set.sequence)
    _needed_figure_to_count = {
        "9": 0,
        "10": 0,
        "jack": 0,
        "queen": 0,
        "king": 0,
    }

    for card in check_set.cards:
        figure = card[0]
        color = card[1]

        if figure in _needed_figure_to_count and color == needed_color:
            _needed_figure_to_count[figure] += 1

    if all(list(_needed_figure_to_count.values())):
        return True

    return False


def _big_poker(check_set: CheckSet) -> bool:
    needed_color = _remove_prefix(check_set.sequence)
    _needed_figure_to_count = {
        "10": 0,
        "jack": 0,
        "queen": 0,
        "king": 0,
        "ace": 0,
    }

    for card in check_set.cards:
        figure = card[0]
        color = card[1]

        if figure in _needed_figure_to_count and color == needed_color:
            _needed_figure_to_count[figure] += 1

    if all(list(_needed_figure_to_count.values())):
        return True

    return False


_sequence_type_to_function: dict[str, Callable[[CheckSet], bool]] = {
    SEQUENCE.HIGH_CARD: _high_card,
    SEQUENCE.ONE_PAIR: _one_pair,
    SEQUENCE.TWO_PAIR: _two_pair,
    SEQUENCE.SMALL_STRAIGHT: _small_straight,
    SEQUENCE.BIG_STRAIGHT: _big_straight,
    SEQUENCE.THREE_OF_A_KIND: _three_of_a_kind,
    SEQUENCE.FULL: _full,
    SEQUENCE.COLOR: _color,
    SEQUENCE.FOUR_OF_A_KIND: _four_of_a_kind,
    SEQUENCE.SMALL_POKER: _small_poker,
    SEQUENCE.BIG_POKER: _big_poker,
}


def check(check_set: CheckSet) -> bool:
    """
    Return True if given check set is correct.
    """
    _logger.info(f"Checking sequence: {check_set.sequence}")
    cards_str = "\n".join([str(card) for card in check_set.cards])
    _logger.info("Available cards: \n" + cards_str + "\n")
    match = re.search(r"\[.*?]", check_set.sequence)
    sequence_type = match.group(0)
    _function = _sequence_type_to_function[sequence_type]
    is_in = _function(check_set)

    if is_in:
        _logger.info("Is in!")
    else:
        _logger.info("Is not in!")

    return is_in
