from typing import Optional
from bluff.game.handler import GameHandler
from bluff.table.data import TableData
from bluff.table.interface import Tables


_table_name_to_data: dict[str, TableData] = {}
_sid_to_table_name: dict[str, str] = dict()


class TablesInMemory(Tables):
    """
    Table implementation that stores the table data in memory.
    """

    @classmethod
    def get_table_data(cls, table_name: str) -> TableData:
        """
        Returns the table data for the given table name.
        """
        return _table_name_to_data[table_name]

    @staticmethod
    def add_table(table_data: TableData) -> None:
        """
        Sets the table data for the given table name.
        """
        _table_name_to_data[table_data.name] = table_data

    @staticmethod
    def remove_table(table_name: str) -> None:
        """
        Deletes the table data for the given table name.
        """
        del _table_name_to_data[table_name]

    @staticmethod
    def get_tables() -> list[TableData]:
        """
        Returns the table data for all tables.
        """
        return list(_table_name_to_data.values())

    @staticmethod
    def get_game(table_name: str) -> GameHandler:
        return _table_name_to_data[table_name].game_handler

    @staticmethod
    def get_table_by_sid(sid: str) -> Optional[TableData]:
        table_name = _sid_to_table_name.get(sid, None)

        if table_name is None:
            return None

        return _table_name_to_data.get(table_name, None)

    @staticmethod
    def add_user_to_table(table: TableData, sid: str) -> None:
        _sid_to_table_name[sid] = table.name
