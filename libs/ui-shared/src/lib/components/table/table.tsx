import { Table, flexRender } from "@tanstack/react-table";
import styled from "styled-components";
import { size } from "../../theme";
import { List, ListDivider } from "../list";

export const CenteredCell = styled.div`
  text-align: center;
  height: ${size("listElementHeight")};
  overflow: hidden;
`;

export const TableLayout = ({ table }: { table: Table<any> }) => {
  return (
    <List>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  <CenteredCell>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </CenteredCell>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  <CenteredCell>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </CenteredCell>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </List>
  );
};

export default TableLayout;
