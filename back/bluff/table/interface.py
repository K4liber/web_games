from abc import ABCMeta, abstractmethod
from typing import Optional

from bluff.game.handler import GameHandler
from bluff.table.data import TableData


class TablesManagerInterface(metaclass=ABCMeta):
    """
    Interface of tables manager.
    """

    @staticmethod
    @abstractmethod
    def get_table_data(table_name: str) -> Optional[TableData]:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def get_tables() -> list[TableData]:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def add_table(table_data: TableData) -> None:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def remove_table(table_name: str) -> None:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def get_game(table_name: str) -> GameHandler:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def get_table_by_sid(sid: str) -> TableData:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def add_user_to_table(table: TableData, sid: str) -> None:
        raise NotImplementedError
