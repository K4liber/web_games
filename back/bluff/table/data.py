from dataclasses import dataclass
from typing import Optional, Any

from bluff.game import Game


@dataclass
class TableData:
    """
    Dataclass for storing table data.
    """

    name: str
    host: str
    is_public: bool
    game: Game
    password: Optional[str] = None
    max_players: int = 6

    @property
    def dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "host": self.host,
            "players": [player.username for player in self.game.players],
            "isPublic": self.is_public,
            "isStarted": self.game.is_started,
            "maxNumberOfPlayers": self.max_players,
        }
