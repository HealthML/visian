import { render } from "@testing-library/react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import TableLayout from "./table";

describe("Table", () => {
  it("should render successfully", () => {
    type TestType = {
      property1: string;
      property2: string;
    };
    const columnHelper = createColumnHelper<TestType>();

    const columns = [
      columnHelper.accessor("property1", {
        header: "Property 1",
      }),
      columnHelper.accessor("property2", {
        header: "Property 2",
      }),
    ];

    const data: TestType[] = [
      {
        property1: "value1",
        property2: "value2",
      },
      {
        property1: "value3",
        property2: "value4",
      },
    ];

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    const { baseElement } = render(<TableLayout table={table} />);
    expect(baseElement).toBeTruthy();
  });
});
