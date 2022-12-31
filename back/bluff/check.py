import logging
import re

from bluff.sequence import SEQUENCE

_logger = logging.getLogger(__name__)
    

def _remove_prefix(sequence: str):
    match = re.search(r"\[.*?]", sequence)
    sequence_type = match.group(0)
    return sequence.removeprefix(f'{sequence_type} ')


def _high_card(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    high_card = _remove_prefix(sequence)

    for card in cards:
        figure = card[0]

        if high_card == figure:
            return True
    
    return False


def _one_pair(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    pair = _remove_prefix(sequence)
    number_of_cards = 0

    for card in cards:
        figure = card[0]

        if pair == figure:
            number_of_cards += 1
        
        if number_of_cards == 2:
            return True
    
    return False


def _two_pair(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    pair = _remove_prefix(sequence)
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
            return True
    
    return False


def _small_straight(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
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
        return True

    return False


def _big_straight(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
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
        return True

    return False


def _three_of_a_kind(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    needed_figure = _remove_prefix(sequence)
    number_of_cards = 0

    for card in cards:
        figure = card[0]

        if needed_figure == figure:
            number_of_cards += 1
        
        if number_of_cards == 3:
            return True
    
    return False


def _full(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    pair = _remove_prefix(sequence)
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
            return True
    
    return False


def _color(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    needed_color = _remove_prefix(sequence)
    number_of_cards = 0

    for card in cards:
        color = card[1]

        if needed_color == color:
            number_of_cards += 1
        
        if number_of_cards == 5:
            return True
    
    return False


def _four_of_a_kind(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    needed_figure = _remove_prefix(sequence)
    number_of_cards = 0

    for card in cards:
        figure = card[0]

        if needed_figure == figure:
            number_of_cards += 1
        
        if number_of_cards == 4:
            return True
    
    return False


def _small_poker(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    needed_color = _remove_prefix(sequence)
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
        return True

    return False


def _big_poker(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    needed_color = _remove_prefix(sequence)
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
        return True

    return False

_sequence_type_to_function = {
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
    SEQUENCE.BIG_POKER: _big_poker
}


def check(
    sequence: str,
    cards: list[tuple[str, str]]
) -> bool:
    _logger.info(f'Checking sequence: {sequence}')
    cards_str = "\n".join([str(card) for card in cards])
    _logger.info('Available cards: \n' + cards_str + '\n')
    match = re.search(r"\[.*?]", sequence)
    sequence_type =match.group(0)
    _function = _sequence_type_to_function[sequence_type]
    is_in = _function(sequence, cards)

    if is_in:
        _logger.info('Is in!')
    else:
        _logger.info('Is not in!')

    return is_in
