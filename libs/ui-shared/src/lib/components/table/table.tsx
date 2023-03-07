import styled from "styled-components";
import { fontWeight } from "../../theme";
import { List, ListItem, ListItemLabel } from "../list";

export const TableCell = styled.div.attrs((props: { width?: number }) => props)`
  width: ${(props) => (props.width ? props.width : 20)}%;
  text-align: center;
  margin: auto;
`;

export const HeaderLabel = styled(ListItemLabel)`
  font-weight: ${fontWeight("bold")};
`;

export const TableRow = ({
  data,
  columns,
}: {
  data: any;
  columns: Column[];
}) => {
  const widths = columns.map((column: Column) => column.width);

  return (
    <ListItem>
      <TableCell>
        <ListItemLabel>{data.modelName}</ListItemLabel>
      </TableCell>
      <TableCell>
        <ListItemLabel>{data.modelVersion}</ListItemLabel>
      </TableCell>
      <TableCell>
        <ListItemLabel>{data.startedAt}</ListItemLabel>
      </TableCell>
      <TableCell>
        <ListItemLabel>{data.finishedAt}</ListItemLabel>
      </TableCell>
      <TableCell>
        <ListItemLabel>{data.status}</ListItemLabel>
      </TableCell>
    </ListItem>
  );
};

export const TableHeader = ({ columns }: { columns: Column[] }) => {
  const headers = columns.map((column: Column) => column.header);
  return (
    <ListItem isActive={true}>
      {headers.map((header: string) => (
        <TableCell>
          <HeaderLabel>{header}</HeaderLabel>
        </TableCell>
      ))}
    </ListItem>
  );
};

export type Column = {
  accessor: string;
  header: string;
  cell?: any;
  width?: number;
};

export const TableLayout = ({
  columns,
  data,
}: {
  columns: Column[];
  data: any;
}) => {
  return (
    <List>
      <TableHeader columns={columns} />

      {data.map((rowData: any) => (
        <TableRow data={rowData} columns={columns} />
      ))}
    </List>
  );
};

// export const TableLayout = ({ table }: { table: Table<any> }) => {
//   return (
//     <List>
//       <table>
//         <thead>
//           {table.getHeaderGroups().map((headerGroup) => (
//             <tr key={headerGroup.id}>
//               {headerGroup.headers.map((header) => (
//                 <th key={header.id}>
//                   <CenteredCell>
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext(),
//                         )}
//                   </CenteredCell>
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody>
//           {table.getRowModel().rows.map((row) => (
//             <tr key={row.id}>
//               {row.getVisibleCells().map((cell) => (
//                 <td key={cell.id}>
//                   <CenteredCell>
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </CenteredCell>
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//         <tfoot>
//           {table.getFooterGroups().map((footerGroup) => (
//             <tr key={footerGroup.id}>
//               {footerGroup.headers.map((header) => (
//                 <th key={header.id}>
//                   {header.isPlaceholder
//                     ? null
//                     : flexRender(
//                         header.column.columnDef.footer,
//                         header.getContext(),
//                       )}
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </tfoot>
//       </table>
//     </List>
//   );
// };

export default TableLayout;
