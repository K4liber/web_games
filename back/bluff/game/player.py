from dataclasses import dataclass
import hashlib


@dataclass
class Player:
    """
    Bluff game player.
    """

    sid: str
    username: str
    cards: set[tuple[str, str]]
    number_of_cards: int = 0

    def __str__(self):
        return f"<SID: {self.sid}, USERNAME: {self.username}>"

    def __hash__(self):
        return (
            int(hashlib.sha256(self.sid.encode("utf-8")).hexdigest(), 16)
            % 10**8
        )
