import { Cell, flexRender, Header, Table } from "@tanstack/react-table";
import styled from "styled-components";
import { stopPropagation } from "../../event-handling";
import { List, ListItem } from "../list";

export const TableCell = styled.div.attrs((props: { width?: number }) => props)`
  width: ${(props) => (props.width ? props.width : 20)}%;
  text-align: center;
  display: flex;
  justify-content: center;
  margin: auto;
`;

const TableList = styled(List)`
  overflow-y: auto;
`;

const distributeColumns = (
  columnWidths: number[] | undefined,
  columnCount: number,
) => {
  if (columnWidths && columnWidths.length === columnCount) {
    const sum = columnWidths.reduce((partSum, width) => partSum + width, 0);
    if (sum == 100) {
      return columnWidths;
    }
  }
  return Array(columnCount).fill(100 / columnCount);
};

export const TableRow = ({
  cells,
  columnWidths,
}: {
  cells: Cell<any, unknown>[];
  columnWidths: number[];
}) => {
  return (
    <ListItem>
      {cells.map((cell, index) => (
        <TableCell key={cell.id} width={columnWidths[index]}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </ListItem>
  );
};

export const TableHeader = ({
  headers,
  columnWidths,
}: {
  headers: Header<any, unknown>[];
  columnWidths: number[];
}) => {
  return (
    <ListItem isActive={true}>
      {headers.map((header, index) => (
        <TableCell key={header.id} width={columnWidths[index]}>
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </TableCell>
      ))}
    </ListItem>
  );
};

export const TableLayout = ({
  table,
  columnWidths,
}: {
  table: Table<any>;
  columnWidths?: number[];
}) => {
  // We support only rendering the first header group
  const mainHeaderGroup = table.getHeaderGroups()[0];
  const widths = distributeColumns(
    columnWidths,
    mainHeaderGroup.headers.length,
  );

  return (
    <TableList onWheel={stopPropagation}>
      <TableHeader
        key={mainHeaderGroup.id}
        headers={mainHeaderGroup.headers}
        columnWidths={widths}
      />

      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          cells={row.getVisibleCells()}
          columnWidths={widths}
        />
      ))}
    </TableList>
  );
};

export default TableLayout;
