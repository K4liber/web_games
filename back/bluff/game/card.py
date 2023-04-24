import copy
from dataclasses import dataclass
import itertools


@dataclass(frozen=True)
class _Sequence:
    HIGH_CARD = "[High card]"
    ONE_PAIR = "[One pair]"
    TWO_PAIR = "[Two pair]"
    SMALL_STRAIGHT = "[Small straight]"
    BIG_STRAIGHT = "[Big straight]"
    THREE_OF_A_KIND = "[Three of a kind]"
    FULL = "[Full 3x2]"
    COLOR = "[Color]"
    FOUR_OF_A_KIND = "[Four of a kind]"
    SMALL_POKER = "[Small poker]"
    BIG_POKER = "[Big poker]"


SEQUENCE = _Sequence()


_colors = ["spades", "clubs", "diamonds", "hearts"]
_fig_int_to_str = {x: str(x) for x in range(9, 11)}
_fig_int_to_str.update({11: "jack", 12: "queen", 13: "king", 14: "ace"})
_all_cards = list(itertools.product(list(_fig_int_to_str.values()), _colors))
_sequences_hierarchy = []
_sequences_hierarchy += [
    f"{SEQUENCE.HIGH_CARD} {_fig_int_to_str[figure]}" for figure in range(9, 15)
]
_sequences_hierarchy += [
    f"{SEQUENCE.ONE_PAIR} {_fig_int_to_str[figure]}" for figure in range(9, 15)
]
_sequences_hierarchy += [
    f"{SEQUENCE.TWO_PAIR} {_fig_int_to_str[figure]};{_fig_int_to_str[figure_2]}"
    for figure in range(9, 15)
    for figure_2 in range(9, figure)
]
_sequences_hierarchy += [
    f"{SEQUENCE.SMALL_STRAIGHT}",
    f"{SEQUENCE.BIG_STRAIGHT}",
]
_sequences_hierarchy += [
    f"{SEQUENCE.THREE_OF_A_KIND} {_fig_int_to_str[figure]}"
    for figure in range(9, 15)
]
_sequences_hierarchy += [
    f"{SEQUENCE.FULL} {_fig_int_to_str[figure]};{_fig_int_to_str[figure_2]}"
    for figure in range(9, 15)
    for figure_2 in range(9, 15)
    if figure != figure_2
]
_sequences_hierarchy += [f"{SEQUENCE.COLOR} {color}" for color in _colors]
_sequences_hierarchy += [
    f"{SEQUENCE.FOUR_OF_A_KIND} {_fig_int_to_str[figure]}"
    for figure in range(9, 15)
]
_sequences_hierarchy += [f"{SEQUENCE.SMALL_POKER} {color}" for color in _colors]
_sequences_hierarchy += [f"{SEQUENCE.BIG_POKER} {color}" for color in _colors]


def get_sequence_hierarchy() -> list[str]:
    """
    Get sequence hierarchy.
    """
    return copy.deepcopy(_sequences_hierarchy)


def get_all_cards() -> list[tuple[str, str]]:
    """
    Get all cards.
    """
    return copy.deepcopy(_all_cards)
