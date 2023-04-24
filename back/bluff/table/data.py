from dataclasses import dataclass
from typing import Optional, Any

from bluff.game.handler import GameHandler


@dataclass
class TableData:
    """
    Dataclass for storing table data.
    """

    name: str
    host: str
    is_public: bool
    game_handler: GameHandler
    password: Optional[str] = None
    max_players: int = 6

    @property
    def dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "host": self.host,
            "players": [
                player.username for player in self.game_handler.players
            ],
            "isPublic": self.is_public,
            "isStarted": self.game_handler.is_started,
            "maxNumberOfPlayers": self.max_players,
        }
