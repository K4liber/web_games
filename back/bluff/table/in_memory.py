from bluff.game import Game
from bluff.table.data import TableData
from bluff.table.interface import Tables


_table_name_to_data: dict[str, TableData] = {}


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
    def get_game(table_name: str) -> Game:
        return _table_name_to_data[table_name].game
