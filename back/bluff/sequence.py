from dataclasses import dataclass


@dataclass(frozen=True)
class _Sequence:
    HIGH_CARD = '[High card]'
    ONE_PAIR = '[One pair]'
    TWO_PAIR = '[Two pair]'
    SMALL_STRAIGHT = '[Small straight]'
    BIG_STRAIGHT = '[Big straight]'
    THREE_OF_A_KIND = '[Three of a kind]'
    FULL = '[Full 3x2]'
    COLOR = '[Color]'
    FOUR_OF_A_KIND = '[Four of a kind]'
    SMALL_POKER = '[Small poker]'
    BIG_POKER = '[Big poker]'

SEQUENCE = _Sequence()
